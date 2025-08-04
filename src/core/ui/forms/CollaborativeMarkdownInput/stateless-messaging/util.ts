import { StatelessMessage } from './stateless.message';

export const decodeStatelessMessage = (data: string): StatelessMessage | undefined => {
  try {
    return JSON.parse(data);
  } catch (error: unknown) {
    console.error('Failed to decode stateless message:', error);
    return undefined;
  }
}

export const encodeStatelessMessage = (data: StatelessMessage): string | undefined => {
  try {
    return JSON.stringify(data);
  } catch (error: unknown) {
    console.error('Failed to encode stateless message:', error);
    return undefined;
  }
}

