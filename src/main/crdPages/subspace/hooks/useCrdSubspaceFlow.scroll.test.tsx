import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useScrollToTopOnChange } from '@/core/routing/useScrollToTopOnChange';
import type { SubspaceFlowPhase } from '@/crd/components/space/SubspaceFlowTabs';
import { useCrdSubspaceFlow } from './useCrdSubspaceFlow';

const PHASES: SubspaceFlowPhase[] = [
  { id: 'phase-a', label: 'Phase A' },
  { id: 'phase-b', label: 'Phase B' },
];

// Mirrors the subspace layout: the resolved phase from the real flow hook drives the reset.
const useFlowWithScroll = (phases: SubspaceFlowPhase[]) => {
  const flow = useCrdSubspaceFlow(phases, undefined);
  useScrollToTopOnChange(flow.activePhaseId);
  return { ...flow, navigate: useNavigate() };
};

const renderAt = (entry: string, phases = PHASES) =>
  renderHook(({ phases }) => useFlowWithScroll(phases), {
    initialProps: { phases },
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
    ),
  });

describe('useScrollToTopOnChange with the subspace flow', () => {
  let scrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    scrollTo.mockClear();
  });

  afterEach(() => {
    scrollTo.mockRestore();
  });

  test('does not scroll on the initial mount or a deep link', () => {
    renderAt('/l0/l1?phase=phase-b');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test('switching phase scrolls to the top', () => {
    const { result } = renderAt('/l0/l1');
    act(() => result.current.setActivePhaseId('phase-b'));
    expect(result.current.activePhaseId).toBe('phase-b');
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('re-selecting the active phase does not scroll', () => {
    const { result } = renderAt('/l0/l1?phase=phase-a');
    act(() => result.current.setActivePhaseId('phase-a'));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test('a dialog param change on the same phase does not scroll', () => {
    const { result } = renderAt('/l0/l1?phase=phase-b');
    act(() => result.current.navigate('/l0/l1?phase=phase-b&dialog=updates'));
    act(() => result.current.navigate('/l0/l1?phase=phase-b'));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test('a keepScroll navigation does not scroll', () => {
    const { result } = renderAt('/l0/l1?phase=phase-b');
    act(() => result.current.navigate('/l0/l1', { state: { keepScroll: true } }));
    expect(result.current.activePhaseId).toBe('phase-a');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test('phases loading after mount does not scroll', () => {
    const { result, rerender } = renderAt('/l0/l1', []);
    expect(result.current.activePhaseId).toBeUndefined();
    rerender({ phases: PHASES });
    expect(result.current.activePhaseId).toBe('phase-a');
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
