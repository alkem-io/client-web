import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { SubspaceFlowTabs } from './SubspaceFlowTabs';

vi.mock('@/crd/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('SubspaceFlowTabs desktop strip', () => {
  it('hides the phase navigation with one phase but keeps the actions', () => {
    render(
      <SubspaceFlowTabs
        phases={[{ id: 'p1', label: 'Explore' }]}
        activePhaseId="p1"
        onPhaseChange={() => {}}
        action={<button type="button">share</button>}
      />
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'flow.phaseTab' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'share' })).toBeInTheDocument();
  });

  it('shows the phase navigation with several phases', () => {
    render(
      <SubspaceFlowTabs
        phases={[
          { id: 'p1', label: 'Explore' },
          { id: 'p2', label: 'Build' },
        ]}
        activePhaseId="p1"
        onPhaseChange={() => {}}
      />
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'flow.phaseTab' })).toHaveLength(2);
  });
});
