import { describe, expect, it } from 'vitest';
import { createSoundOwnerTab } from './soundOwnerTab';

/**
 * Each fake tab has its own document and window (so a visibility change in one
 * tab is not seen by the other) and all tabs share one storage, as same-origin
 * tabs share localStorage.
 */
const makeStorage = (): Storage => {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: key => data.get(key) ?? null,
    key: index => [...data.keys()][index] ?? null,
    removeItem: key => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

const makeTab = (storage: () => Storage, initiallyVisible: boolean) => {
  const doc = Object.assign(new EventTarget(), {
    visibilityState: (initiallyVisible ? 'visible' : 'hidden') as DocumentVisibilityState,
  });
  const win = new EventTarget();
  const owner = createSoundOwnerTab({ doc, win, storage });
  const setVisibility = (state: DocumentVisibilityState) => {
    doc.visibilityState = state;
    doc.dispatchEvent(new Event('visibilitychange'));
  };
  return {
    isOwner: owner.isOwner,
    stop: owner.stop,
    show: () => setVisibility('visible'),
    hide: () => setVisibility('hidden'),
    focus: () => win.dispatchEvent(new Event('focus')),
    close: () => win.dispatchEvent(new Event('pagehide')),
  };
};

describe('createSoundOwnerTab', () => {
  it('makes exactly one tab the owner: the one the user saw last', () => {
    const storage = makeStorage();
    const a = makeTab(() => storage, true);
    expect(a.isOwner()).toBe(true);

    // The user opens a second tab in the foreground; the first is hidden.
    a.hide();
    const b = makeTab(() => storage, true);
    expect([a.isOwner(), b.isOwner()]).toEqual([false, true]);

    // Switching back moves ownership back.
    b.hide();
    a.show();
    expect([a.isOwner(), b.isOwner()]).toEqual([true, false]);

    // Focusing a window (another browser window) also moves it.
    b.focus();
    expect([a.isOwner(), b.isOwner()]).toEqual([false, true]);
  });

  it('keeps the last-seen tab as owner while every tab is hidden', () => {
    const storage = makeStorage();
    const a = makeTab(() => storage, true);
    const b = makeTab(() => storage, false);

    // The user leaves for another application or site.
    a.hide();
    expect([a.isOwner(), b.isOwner()]).toEqual([true, false]);
  });

  it('never makes a tab that was opened in the background the owner until it is shown', () => {
    const storage = makeStorage();
    const a = makeTab(() => storage, true);
    const background = makeTab(() => storage, false);
    expect(background.isOwner()).toBe(false);

    // Showing it later makes it the owner from then on; nothing it was told
    // while hidden is replayed by this module.
    background.show();
    expect([a.isOwner(), background.isOwner()]).toEqual([false, true]);
  });

  it('releases ownership when the owner closes, without clearing a newer owner', () => {
    const storage = makeStorage();
    const a = makeTab(() => storage, true);
    const shownEarlier = makeTab(() => storage, true);
    const b = makeTab(() => storage, false);
    const never = makeTab(() => storage, false);

    // The browser shows another tab before the closing tab's pagehide runs:
    // that stale pagehide must not clear the newer owner.
    b.show();
    a.close();
    expect([b.isOwner(), shownEarlier.isOwner(), never.isOwner()]).toEqual([true, false, false]);

    // The owner closes with no other tab shown: no owner is recorded, so each
    // tab that has been shown falls back to owning, and a tab never shown
    // still does not.
    b.close();
    expect([shownEarlier.isOwner(), never.isOwner()]).toEqual([true, false]);
    never.show();
    expect([shownEarlier.isOwner(), never.isOwner()]).toEqual([false, true]);
  });

  it('stops listening and releases ownership on stop', () => {
    const storage = makeStorage();
    const a = makeTab(() => storage, true);
    a.stop();
    expect(storage.length).toBe(0);
    a.show();
    expect(storage.length).toBe(0);
  });

  it('falls back to "this tab has been shown" when storage is unavailable', () => {
    const unavailable = () => {
      throw new DOMException('denied', 'SecurityError');
    };
    const shown = makeTab(unavailable, true);
    const background = makeTab(unavailable, false);

    expect([shown.isOwner(), background.isOwner()]).toEqual([true, false]);
    expect(() => {
      background.show();
      background.close();
      shown.stop();
    }).not.toThrow();
    expect(background.isOwner()).toBe(true);
  });
});
