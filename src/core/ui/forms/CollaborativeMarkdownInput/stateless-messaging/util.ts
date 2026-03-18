import type { StatelessMessage } from './stateless.message';

export const decodeStatelessMessage = (data: string): StatelessMessage | undefined => {
  try {
    return JSON.parse(data);
  } catch (_error: unknown) {
    return undefined;
  }
};

export const encodeStatelessMessage = (data: StatelessMessage): string | undefined => {
  try {
    return JSON.stringify(data);
  } catch (_error: unknown) {
    return undefined;
  }
};
