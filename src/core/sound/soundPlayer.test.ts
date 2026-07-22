import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

/**
 * jsdom does not implement `HTMLMediaElement.prototype.play`, so it is stubbed.
 * The player holds module-level debounce state, so each test re-imports the
 * module fresh via `vi.resetModules()`.
 */
describe('soundPlayer', () => {
  let playMock: Mock<() => Promise<void>>;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    playMock = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(playMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('plays at t=0', async () => {
    const { playSound } = await import('./soundPlayer');
    playSound('chat');
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('debounces within the rolling 5s window and plays again exactly at the boundary', async () => {
    const { playSound } = await import('./soundPlayer');

    playSound('chat'); // t=0 → plays
    expect(playMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(4999);
    playSound('chat'); // t=4999 → skipped (4999 < 5000)
    expect(playMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    playSound('chat'); // t=5000 → plays (5000 is not < 5000)
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('debounces each key independently', async () => {
    const { playSound } = await import('./soundPlayer');

    playSound('chat');
    playSound('notification');
    expect(playMock).toHaveBeenCalledTimes(2);

    // A second chat within the window is skipped, but notification is unaffected.
    vi.advanceTimersByTime(1000);
    playSound('chat'); // skipped
    playSound('notification'); // skipped (its own window is still open)
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('does not throw when play() rejects (autoplay policy — FR-011)', async () => {
    playMock.mockRejectedValue(new DOMException('play() failed', 'NotAllowedError'));
    const { playSound } = await import('./soundPlayer');

    expect(() => playSound('chat')).not.toThrow();
    // Flush the swallowed rejection so no unhandled-rejection warning leaks.
    await Promise.resolve();
    expect(playMock).toHaveBeenCalledTimes(1);
  });
});
