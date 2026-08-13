import { beforeEach, describe, expect, it, vi } from 'vitest';
import Portal from '../Portal';

/**
 * Portal reports WHY a connection closed so the disconnected notice can decide whether to offer the
 * "Reload page" escape hatch (story #10131):
 * - a failed connection attempt (`connect_error`) is a real error → `onCloseConnection(true)`;
 * - a transient drop (`disconnect`) may auto-heal → `onCloseConnection(false)`;
 * - an intentional client disconnect is silent → `onCloseConnection` is not called.
 */

// Shared, hoisted so the (hoisted) vi.mock factory can reference it.
const socketMock = vi.hoisted(() => {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const socket = {
    on: (event: string, cb: (...args: unknown[]) => void) => {
      handlers.set(event, cb);
      return socket;
    },
    emit: vi.fn(),
    close: vi.fn(),
    id: 'test-socket',
  };
  return { handlers, socket, connect: vi.fn(() => socket) };
});

vi.mock('socket.io-client', () => ({ default: socketMock.connect }));
// The scene-utils import Portal.open() awaits; keep it cheap and offline.
vi.mock('@alkemio/excalidraw', () => ({ isInvisiblySmallElement: () => false }));

const buildPortal = (onCloseConnection: (hasError: boolean) => void) =>
  new Portal({
    onRemoteSave: vi.fn(),
    onCloseConnection,
    onRoomUserChange: vi.fn(),
    getSceneElements: () => [],
    getFiles: () => ({}),
  } as unknown as ConstructorParameters<typeof Portal>[0]);

const openPortal = async (portal: Portal) => {
  // open() resolves only once 'connect' fires; we only need the listeners registered, and its promise
  // rejects on the error paths we trigger below, so swallow it.
  portal
    .open({ url: 'http://localhost', path: '/', polling: false, roomId: 'room-1' } as never, {} as never)
    .catch(() => undefined);
  await vi.waitFor(() => expect(socketMock.handlers.has('connect_error')).toBe(true));
};

describe('Portal close-connection error reporting', () => {
  beforeEach(() => {
    socketMock.handlers.clear();
    socketMock.connect.mockClear();
  });

  it('reports an error when a connection attempt fails (connect_error)', async () => {
    const onCloseConnection = vi.fn();
    await openPortal(buildPortal(onCloseConnection));

    socketMock.handlers.get('connect_error')?.();

    expect(onCloseConnection).toHaveBeenCalledTimes(1);
    expect(onCloseConnection).toHaveBeenCalledWith(true);
  });

  it('reports a non-error close for an unexpected transient drop (disconnect)', async () => {
    const onCloseConnection = vi.fn();
    await openPortal(buildPortal(onCloseConnection));

    socketMock.handlers.get('disconnect')?.('transport close');

    expect(onCloseConnection).toHaveBeenCalledTimes(1);
    expect(onCloseConnection).toHaveBeenCalledWith(false);
  });

  it('stays silent when the client disconnects intentionally', async () => {
    const onCloseConnection = vi.fn();
    await openPortal(buildPortal(onCloseConnection));

    socketMock.handlers.get('disconnect')?.('io client disconnect');

    expect(onCloseConnection).not.toHaveBeenCalled();
  });
});
