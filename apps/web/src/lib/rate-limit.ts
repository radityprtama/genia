export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

export type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

export interface RateLimiter {
  check(identifier: string): Promise<RateLimitResult>;
  reset(identifier: string): Promise<void>;
}

class InMemoryRateLimiter implements RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    if (typeof setInterval !== "undefined") {
      setInterval(
        () => {
          const now = Date.now();
          for (const [key, value] of this.store.entries()) {
            if (now > value.resetTime) {
              this.store.delete(key);
            }
          }
        },
        this.config.windowMs * 2
      );
    }
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || now > record.resetTime) {
      const resetTime = now + this.config.windowMs;
      this.store.set(identifier, { count: 1, resetTime });
      return {
        success: true,
        remaining: this.config.limit - 1,
        reset: resetTime,
      };
    }

    if (record.count >= this.config.limit) {
      return {
        success: false,
        remaining: 0,
        reset: record.resetTime,
      };
    }

    record.count++;
    return {
      success: true,
      remaining: this.config.limit - record.count,
      reset: record.resetTime,
    };
  }

  async reset(identifier: string): Promise<void> {
    this.store.delete(identifier);
  }
}

class UpstashRateLimiter implements RateLimiter {
  private config: RateLimitConfig;
  private redis: {
    eval: (
      script: string,
      keys: string[],
      args: (string | number)[]
    ) => Promise<[number, number]>;
    del: (key: string) => Promise<number>;
  } | null = null;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.initRedis();
  }

  private async initRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      try {
        const { Redis } = await import("@upstash/redis");
        this.redis = new Redis({ url, token });
      } catch {
        console.warn(
          "Failed to initialize Upstash Redis. Install @upstash/redis for distributed rate limiting."
        );
      }
    }
  }

  async check(identifier: string): Promise<RateLimitResult> {
    if (!this.redis) {
      console.warn("Redis not available for rate limiting");
      return { success: true, remaining: this.config.limit, reset: Date.now() };
    }

    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    const script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])
      local windowStart = now - window

      redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

      local count = redis.call('ZCARD', key)

      if count < limit then
        redis.call('ZADD', key, now, now .. '-' .. math.random())
        redis.call('PEXPIRE', key, window)
        return {count + 1, now + window}
      else
        return {count, now + window}
      end
    `;

    try {
      const [count, reset] = await this.redis.eval(
        script,
        [key],
        [now, this.config.windowMs, this.config.limit]
      );

      return {
        success: count <= this.config.limit,
        remaining: Math.max(0, this.config.limit - count),
        reset,
      };
    } catch (error) {
      console.error("Rate limit check failed:", error);
      return { success: true, remaining: this.config.limit, reset: Date.now() };
    }
  }

  async reset(identifier: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(`ratelimit:${identifier}`);
    }
  }
}

export const RATE_LIMIT_CONFIGS = {
  auth: {
    limit: 100,
    windowMs: 60 * 1000,
  },
  api: {
    limit: 1000,
    windowMs: 60 * 1000,
  },
  sensitive: {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  },
} as const;

const rateLimiters = new Map<string, RateLimiter>();

export function getRateLimiter(
  name: keyof typeof RATE_LIMIT_CONFIGS | string,
  config?: RateLimitConfig
): RateLimiter {
  const key = name;
  let limiter = rateLimiters.get(key);

  if (!limiter) {
    const finalConfig =
      config ||
      (name in RATE_LIMIT_CONFIGS
        ? RATE_LIMIT_CONFIGS[name as keyof typeof RATE_LIMIT_CONFIGS]
        : RATE_LIMIT_CONFIGS.api);

    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      limiter = new UpstashRateLimiter(finalConfig);
    } else {
      if (process.env.NODE_ENV === "production") {
        console.warn(
          `[rate-limit] Using in-memory rate limiting for "${name}". ` +
            "This will not work correctly in serverless/multi-instance environments. " +
            "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production."
        );
      }
      limiter = new InMemoryRateLimiter(finalConfig);
    }

    rateLimiters.set(key, limiter);
  }

  return limiter;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export async function isRateLimited(
  identifier: string,
  limiterName: keyof typeof RATE_LIMIT_CONFIGS = "api"
): Promise<boolean> {
  const limiter = getRateLimiter(limiterName);
  const result = await limiter.check(identifier);
  return !result.success;
}
