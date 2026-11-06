import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import CrdSubspaceCalloutsPage from './CrdSubspaceCalloutsPage';

const outletContext = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock('react-router-dom', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useOutletContext: () => outletContext.current,
}));
vi.mock('@/crd/hooks/useMediaQuery', () => ({ useMediaQuery: () => true }));
vi.mock('@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet', () => ({
  default: () => ({ callouts: [], loading: false, calloutsSetAuthorization: undefined }),
}));
vi.mock('../../space/callout/CalloutListConnector', () => ({ CalloutListConnector: () => null }));
vi.mock('../../space/callout/LazyCalloutItem', () => ({ LazyCalloutItem: () => null }));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const renderPage = (phases: { id: string; label: string }[], menuAvailable: boolean) => {
  outletContext.current = {
    data: { phases, currentPhaseId: phases[0]?.id, calloutsSetId: 'set', canEditFlow: false, subspaceUrl: '/s' },
    mobileMenu: { available: menuAvailable, open: false, onOpenChange: () => {}, content: null },
    headerActionIcons: null,
    search: undefined,
  };
  return render(
    <MemoryRouter>
      <CrdSubspaceCalloutsPage />
    </MemoryRouter>
  );
};

const clearance = (container: HTMLElement) => container.querySelector('.h-20');

describe('CrdSubspaceCalloutsPage mobile bottom-bar clearance', () => {
  it('reserves no clearance when a single phase and no menu leave no bottom bar', () => {
    const { container } = renderPage([{ id: 'p1', label: 'Explore' }], false);
    expect(clearance(container)).toBeNull();
  });

  it('reserves clearance when the bottom bar carries the menu', () => {
    const { container } = renderPage([{ id: 'p1', label: 'Explore' }], true);
    expect(clearance(container)).not.toBeNull();
  });

  it('reserves clearance when the bottom bar carries several phases', () => {
    const { container } = renderPage(
      [
        { id: 'p1', label: 'Explore' },
        { id: 'p2', label: 'Act' },
      ],
      false
    );
    expect(clearance(container)).not.toBeNull();
  });
});
