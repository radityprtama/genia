import React from "react";
import { ProductIllustration } from "../illustrations/product-illustration";
import { GridPattern } from "../blog/grid-pattern";

interface HeroSectionProps {
  isAuthenticated?: boolean;
}

export default function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <>
      <main role="main" className="bg-muted overflow-hidden">
        <section id="home" className="relative py-32 md:py-44 lg:py-52">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <GridPattern
              className="stroke-foreground/5 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"
              width={40}
              height={40}
              x={-1}
              y={-1}
            />
          </div>

          <div className="relative z-30 mx-auto max-w-5xl px-6 text-center">
            <h1 className="mx-auto max-w-3xl font-[family-name:var(--font-geist-sans)] text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Build, scale, and sell websites with AI
            </h1>

            <p className="mx-auto mt-6 mb-7 max-w-xl font-[family-name:var(--font-geist-sans)] text-balance text-lg text-muted-foreground leading-relaxed sm:text-xl">
              Generate professional websites in seconds. Perfect for agencies,
              freelancers, and entrepreneurs
            </p>

            <ProductIllustration isAuthenticated={isAuthenticated} />
          </div>
        </section>
        <section className="border-foreground/10 relative mt-8 border-y sm:mt-16">
          <div className="relative z-10 mx-auto max-w-6xl border-x px-3">
            <div className="border-x">
              <div
                aria-hidden
                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
              />
              <img
                className="border-t shadow-md"
                src="https://res.cloudinary.com/dohqjvu9k/image/upload/v1755171585/oxy_jjuhdv.webp"
                alt="Genia overview"
                width={1280}
                height={720}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
