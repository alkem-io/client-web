import type { MatrixClient, Room } from 'matrix-js-sdk';
import { describe, expect, it, vi } from 'vitest';
import { isFavourite, resolveMatrixRoomId } from './matrixRooms';

const makeClient = (lookup: (alias: string) => Promise<{ room_id: string }>) => {
  const getRoomIdForAlias = vi.fn(lookup);
  return {
    client: { getUserId: () => '@me:hs.test', getRoomIdForAlias } as unknown as MatrixClient,
    getRoomIdForAlias,
  };
};

describe('resolveMatrixRoomId', () => {
  it('maps an Alkemio room id to its Matrix room through the adapter alias on the own homeserver', async () => {
    const { client, getRoomIdForAlias } = makeClient(async () => ({ room_id: '!abc:hs.test' }));

    await expect(resolveMatrixRoomId(client, 'alk-room')).resolves.toBe('!abc:hs.test');
    expect(getRoomIdForAlias).toHaveBeenCalledWith('#alk-room:hs.test');
  });

  it('looks a conversation up once per client', async () => {
    const { client, getRoomIdForAlias } = makeClient(async () => ({ room_id: '!abc:hs.test' }));

    await resolveMatrixRoomId(client, 'alk-room');
    await resolveMatrixRoomId(client, 'alk-room');

    expect(getRoomIdForAlias).toHaveBeenCalledTimes(1);
  });

  it('gives null for a room without an alias and tries again on the next call', async () => {
    const { client, getRoomIdForAlias } = makeClient(async () => {
      throw new Error('M_NOT_FOUND');
    });

    await expect(resolveMatrixRoomId(client, 'unlisted')).resolves.toBeNull();
    await expect(resolveMatrixRoomId(client, 'unlisted')).resolves.toBeNull();

    expect(getRoomIdForAlias).toHaveBeenCalledTimes(2);
  });
});

describe('isFavourite', () => {
  it('is true only for a room carrying the favourite tag', () => {
    expect(isFavourite({ tags: { 'm.favourite': {} } } as unknown as Room)).toBe(true);
    expect(isFavourite({ tags: { 'm.lowpriority': {} } } as unknown as Room)).toBe(false);
  });
});
