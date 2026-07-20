export type PublishInput = {
  projectDir: string;
  name: string;
  workspaceId?: string;
};

export type PublishResult = {
  url: string;
  deploymentId?: string;
  error?: string;
};

export interface PublishService {
  publish(input: PublishInput): Promise<PublishResult>;
}

export type PublishStrategy = 'vercel' | 'zip' | 'workspaceSave';

export function getPublishService(strategy: PublishStrategy = 'vercel'): PublishService {
  switch (strategy) {
    case 'vercel':
      return {
        publish: async (input: PublishInput) => {
          const { vercelPublish } = await import('./vercel');
          return vercelPublish(input);
        }
      };
    case 'zip':
      return {
        publish: async (input: PublishInput) => {
          return {
            url: '#',
            error: 'ZIP download not yet implemented'
          };
        }
      };
    case 'workspaceSave':
      return {
        publish: async (input: PublishInput) => {
          return {
            url: '#',
            error: 'Workspace save not yet implemented'
          };
        }
      };
    default:
      throw new Error(`Unknown publish strategy: ${strategy}`);
  }
}
