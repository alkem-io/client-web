import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SpaceCardData } from './SpaceCard';
import { SpaceExplorer } from './SpaceExplorer';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('./SpaceCard', () => ({
  SpaceCard: ({ space }: { space: SpaceCardData }) => <a href={space.href}>{space.name}</a>,
  SpaceCardSkeleton: () => <div>Skeleton</div>,
}));

let intersect: IntersectionObserverCallback;
const disconnect = vi.fn();

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback;
      }
      observe() {}
      disconnect = disconnect;
    }
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const props = () => ({ spaces: [], loading: true, onLoadMore: vi.fn(async () => {}) });
const enter = () =>
  act(() => intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));

describe('FC-X1 root explorer presentation', () => {
  it('visibly disables unserved controls and removes the Load more button', () => {
    render(<SpaceExplorer {...props()} loading={false} />);
    expect(screen.getByPlaceholderText('spaces.searchPlaceholder')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'spaces.filters' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /loadMore/ })).not.toBeInTheDocument();
  });

  it('uses one continuation while visible and stops observing at the end', async () => {
    let resolve: () => void = () => {};
    const next = vi.fn(
      () =>
        new Promise<void>(done => {
          resolve = done;
        })
    );
    const input = { ...props(), loading: false, hasMore: true, onLoadMore: next };
    const view = render(<SpaceExplorer {...input} />);
    enter();
    enter();
    expect(next).toHaveBeenCalledTimes(1);
    await act(async () => {
      view.rerender(<SpaceExplorer {...input} hasMore={false} />);
      resolve();
    });
    await waitFor(() => expect(disconnect).toHaveBeenCalled());
    expect(next).toHaveBeenCalledTimes(1);
  });
});
