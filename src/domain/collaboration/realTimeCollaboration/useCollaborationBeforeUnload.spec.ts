import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCollaborationBeforeUnload } from '@/domain/collaboration/realTimeCollaboration/useCollaborationBeforeUnload';

describe('useCollaborationBeforeUnload', () => {
  afterEach(() => vi.restoreAllMocks());

  it('warns only while the provider reports changes at risk', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { rerender, unmount } = renderHook(
      ({ atRisk }: { atRisk: boolean }) => useCollaborationBeforeUnload(atRisk),
      { initialProps: { atRisk: false } }
    );

    expect(add.mock.calls.some(([kind]) => kind === 'beforeunload')).toBe(false);
    rerender({ atRisk: true });
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
