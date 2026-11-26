import type { MatrixClient } from 'matrix-js-sdk';
import { describe, expect, it } from 'vitest';
import { nativeEntityId, nativeMatrixId } from './matrixRooms';

const room = '019435a6-8be3-7d28-a5f2-b05f03f76455';
const server = 'hs.test:8448';
const client = { getUserId: () => `@me:${server}` } as MatrixClient;

describe('native Matrix IDs', () => {
  it('round-trips a canonical room UUID on the session homeserver', () => {
    expect(nativeMatrixId(room, '!', client)).toBe(`!${room}:${server}`);
    expect(nativeEntityId(`!${room}:${server}`, '!', client)).toBe(room);
  });

  it('refuses synthetic, foreign, wrong-kind and noncanonical IDs', () => {
    expect(nativeMatrixId('old-identifier', '!', client)).toBeUndefined();
    expect(nativeMatrixId(room.toUpperCase(), '!', client)).toBeUndefined();
    expect(nativeEntityId(`!${room}:other.test`, '!', client)).toBeUndefined();
    expect(nativeEntityId(`@${room}:${server}`, '!', client)).toBeUndefined();
  });
});
