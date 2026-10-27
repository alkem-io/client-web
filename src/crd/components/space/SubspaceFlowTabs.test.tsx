import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { SubspaceFlowTabs } from './SubspaceFlowTabs';

vi.mock('@/crd/hooks/useMediaQuery', () => ({ useMediaQuery: () => true }));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const phases = [{ id: 'p1', label: 'Explore' }];

describe('SubspaceFlowTabs mobile bar', () => {
  it('shows the menu button when the drawer can open', () => {
    render(
      <SubspaceFlowTabs phases={phases} activePhaseId="p1" onPhaseChange={() => {}} onMobileMenuOpenChange={() => {}} />
    );
    expect(screen.getByRole('button', { name: 'a11y.openMenu' })).toBeInTheDocument();
  });

  it('hides the menu button when there is nothing to open', () => {
    render(<SubspaceFlowTabs phases={phases} activePhaseId="p1" onPhaseChange={() => {}} />);
    expect(screen.queryByRole('button', { name: 'a11y.openMenu' })).not.toBeInTheDocument();
  });
});
