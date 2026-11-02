import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContributionGrid } from './ContributionGrid';
import { ContributionsPreviewSkeleton } from './ContributionsPreviewSkeleton';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => (options?.count === undefined ? key : `${key}:${options.count}`),
  }),
}));

// jsdom has no grid layout: force the rendered column count the grid reads.
const gridMock = vi.hoisted(() => ({ columnCount: 3 }));
vi.mock('@/crd/hooks/useGridColumnCount', () => ({
  useGridColumnCount: () => [gridMock.columnCount, () => {}],
}));

// jsdom has no layout either: each card reports the top/height given in its data attributes.
const offsetTop = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetTop');
const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
let resizeCallbacks: ResizeObserverCallback[] = [];
const OriginalResizeObserver = globalThis.ResizeObserver;

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get(this: HTMLElement) {
      return Number(this.dataset.top ?? 0);
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return Number(this.dataset.height ?? 0);
    },
  });
  resizeCallbacks = [];
  globalThis.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      resizeCallbacks.push(callback);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  if (offsetTop) Object.defineProperty(HTMLElement.prototype, 'offsetTop', offsetTop);
  if (offsetHeight) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeight);
  globalThis.ResizeObserver = OriginalResizeObserver;
  gridMock.columnCount = 3;
});

const ROW_HEIGHT = 200;
const GAP = 16;

const cards = (count: number, columns = 3) =>
  Array.from({ length: count }, (_, index) => (
    <div
      key={`card-${index}`}
      data-testid={`card-${index}`}
      data-top={Math.floor(index / columns) * (ROW_HEIGHT + GAP)}
      data-height={ROW_HEIGHT}
    />
  ));

const gridOf = (card: HTMLElement) => card.parentElement as HTMLElement;

describe('ContributionGrid', () => {
  it('lays out one column on phones, two from sm and three from lg', () => {
    render(
      <ContributionGrid contributionCount={1} columns={3}>
        {cards(1)}
      </ContributionGrid>
    );

    expect(gridOf(screen.getByTestId('card-0'))).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });

  it('does not collapse two full rows at the current column count', () => {
    render(
      <ContributionGrid contributionCount={6} columns={3}>
        {cards(6)}
      </ContributionGrid>
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(gridOf(screen.getByTestId('card-0'))).not.toHaveClass('overflow-hidden');
  });

  it('collapses past two rows and counts only the hidden contributions, not the add card', () => {
    render(
      <ContributionGrid contributionCount={8} hasTrailingCard={true} columns={3}>
        {cards(9)}
      </ContributionGrid>
    );

    expect(screen.getByRole('button', { name: 'callout.moreContributions:2' })).toBeInTheDocument();
  });

  it('clips through the middle of the second row and re-measures when a card resizes', () => {
    render(
      <ContributionGrid contributionCount={9} columns={3}>
        {cards(9)}
      </ContributionGrid>
    );
    const grid = gridOf(screen.getByTestId('card-0'));

    expect(grid).toHaveClass('overflow-hidden');
    expect(grid.style.maxHeight).toBe(`${ROW_HEIGHT + GAP + ROW_HEIGHT / 2}px`);

    // A second-row whiteboard grows once its preview image loads.
    screen.getByTestId('card-4').dataset.height = '300';
    act(() => {
      for (const callback of resizeCallbacks) callback([], {} as ResizeObserver);
    });

    expect(grid.style.maxHeight).toBe(`${ROW_HEIGHT + GAP + 150}px`);
  });

  it('reveals every contribution on a single Show more click', async () => {
    const user = userEvent.setup();
    render(
      <ContributionGrid contributionCount={9} columns={3}>
        {cards(9)}
      </ContributionGrid>
    );
    const grid = gridOf(screen.getByTestId('card-0'));

    await user.click(screen.getByRole('button', { name: 'callout.moreContributions:3' }));

    expect(grid).not.toHaveClass('overflow-hidden');
    expect(grid.style.maxHeight).toBe('');
    expect(screen.getByRole('button', { name: 'callout.collapse' })).toBeInTheDocument();
  });

  it('follows the rendered column count when deciding to collapse', () => {
    gridMock.columnCount = 1;
    render(
      <ContributionGrid contributionCount={3} columns={3}>
        {cards(3, 1)}
      </ContributionGrid>
    );

    expect(screen.getByRole('button', { name: 'callout.moreContributions:1' })).toBeInTheDocument();
  });
});

describe('ContributionsPreviewSkeleton', () => {
  it('matches the three-column grid', () => {
    const { container } = render(<ContributionsPreviewSkeleton kind="whiteboard" count={3} columns={3} />);

    expect(container.firstElementChild).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });
});
