import type { MatrixClient, Room } from 'matrix-js-sdk';
import { describe, expect, it, vi } from 'vitest';
import { isFavourite, resolveMatrixRoomId, setFavourite } from './matrixRooms';

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

describe('setFavourite', () => {
  const makeTagClient = (knownRooms: string[]) => {
    const setRoomTag = vi.fn(async () => ({}));
    const deleteRoomTag = vi.fn(async () => ({}));
    const client = {
      getUserId: () => '@me:hs.test',
      getRoomIdForAlias: vi.fn(async (alias: string) => {
        if (alias === '#unlisted:hs.test') throw new Error('M_NOT_FOUND');
        return { room_id: `!${alias.slice(1, alias.indexOf(':'))}` };
      }),
      getRoom: (roomId: string) => (knownRooms.includes(roomId) ? { roomId } : null),
      setRoomTag,
      deleteRoomTag,
    } as unknown as MatrixClient;
    return { client, setRoomTag, deleteRoomTag };
  };

  it("pins by setting the favourite tag on the conversation's Matrix room", async () => {
    const { client, setRoomTag } = makeTagClient(['!alk-room']);

    await setFavourite(client, 'alk-room', true);

    expect(setRoomTag).toHaveBeenCalledWith('!alk-room', 'm.favourite');
  });

  it('unpins by deleting the favourite tag', async () => {
    const { client, deleteRoomTag } = makeTagClient(['!alk-room']);

    await setFavourite(client, 'alk-room', false);

    expect(deleteRoomTag).toHaveBeenCalledWith('!alk-room', 'm.favourite');
  });

  it('rejects without writing when the room has no alias or the client does not have it yet', async () => {
    const { client, setRoomTag } = makeTagClient([]);

    await expect(setFavourite(client, 'unlisted', true)).rejects.toThrow();
    await expect(setFavourite(client, 'not-joined', true)).rejects.toThrow();

    expect(setRoomTag).not.toHaveBeenCalled();
  });

  it('rejects when the homeserver refuses the write', async () => {
    const { client, setRoomTag } = makeTagClient(['!alk-room']);
    setRoomTag.mockRejectedValueOnce(new Error('M_FORBIDDEN'));

    await expect(setFavourite(client, 'alk-room', true)).rejects.toThrow('M_FORBIDDEN');
  });
});
