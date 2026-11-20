import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';
import useResourceTabs from '../useResourceTabs';

type Props = { tabs: ResourceTabKey[]; profileId: string | undefined };

const render = (initial: Props) =>
  renderHook(({ tabs, profileId }: Props) => useResourceTabs(tabs, profileId), { initialProps: initial });

describe('useResourceTabs', () => {
  it('lands on Leading when the profile leads something', () => {
    const { result } = render({ tabs: ['leading', 'memberOf', 'otherResources'], profileId: 'p1' });
    expect(result.current.activeTab).toBe('leading');
  });

  it('lands on Member of when Leading is hidden', () => {
    const { result } = render({ tabs: ['memberOf', 'otherResources'], profileId: 'p1' });
    expect(result.current.activeTab).toBe('memberOf');
  });

  it('keeps an explicit pick while the tab stays visible on the same profile', () => {
    const { result, rerender } = render({ tabs: ['leading', 'memberOf', 'otherResources'], profileId: 'p1' });
    act(() => result.current.onSelectTab('otherResources'));
    rerender({ tabs: ['leading', 'memberOf', 'otherResources'], profileId: 'p1' });
    expect(result.current.activeTab).toBe('otherResources');
  });

  it('falls back to the first visible tab when the picked tab disappears', () => {
    const { result, rerender } = render({ tabs: ['leading', 'memberOf', 'otherResources'], profileId: 'p1' });
    act(() => result.current.onSelectTab('otherResources'));
    rerender({ tabs: ['leading', 'memberOf'], profileId: 'p1' });
    expect(result.current.activeTab).toBe('leading');
  });

  it('does not carry a pick over to another profile', () => {
    const { result, rerender } = render({ tabs: ['leading', 'memberOf'], profileId: 'p1' });
    act(() => result.current.onSelectTab('memberOf'));
    rerender({ tabs: ['leading', 'memberOf'], profileId: 'p2' });
    expect(result.current.activeTab).toBe('leading');
  });
});
