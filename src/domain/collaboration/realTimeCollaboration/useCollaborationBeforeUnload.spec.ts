import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCollaborationBeforeUnload } from './useCollaborationBeforeUnload';

describe('useCollaborationBeforeUnload', () => {
  afterEach(() => vi.restoreAllMocks());

  it('warns for dirty offline work, but not for a clean offline transport', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const offline = { kind: 'active', access: 'write', save: 'offline' } as const;
    const { rerender, unmount } = renderHook(
      ({ dirty }: { dirty: boolean }) => useCollaborationBeforeUnload(offline, dirty),
      { initialProps: { dirty: false } }
    );

    expect(add.mock.calls.some(([kind]) => kind === 'beforeunload')).toBe(false);
    rerender({ dirty: true });
    expect(add.mock.calls.some(([kind]) => kind === 'beforeunload')).toBe(true);
    const beforeUnload = add.mock.calls.find(([kind]) => kind === 'beforeunload')?.[1];
    const event = {
      preventDefault: vi.fn(),
      returnValue: 'unchanged',
    } as unknown as BeforeUnloadEvent;
    (beforeUnload as EventListener)(event);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.returnValue).toBe('');

    unmount();
    expect(remove.mock.calls.some(([kind]) => kind === 'beforeunload')).toBe(true);
  });
});
