import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { ContributionsPreviewConnector } from './ContributionsPreviewConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string, variables?: { count?: number }) =>
      key === 'callout.moreContributions' ? `+${variables?.count} more` : key,
  }),
}));

vi.mock(
  '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutCollaborationPermissions',
  () => ({
    default: () => ({ canCreateContribution: false }),
  })
);

// jsdom has no grid layout: force the column count the preview grid reads.
const gridMock = vi.hoisted(() => ({ columnCount: 3 }));
vi.mock('@/crd/hooks/useGridColumnCount', () => ({
  useGridColumnCount: () => [gridMock.columnCount, () => {}],
}));

const data = vi.hoisted(() => ({ items: [] as unknown[] }));

// Mirrors the real hook's page contract: the first `pageSize` items until `setFetchAll(true)`.
vi.mock('@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions', async () => {
  const { useState } = await import('react');
  return {
    default: ({ pageSize }: { pageSize?: number }) => {
      const [fetchAll, setFetchAll] = useState(false);
      const items = fetchAll ? data.items : data.items.slice(0, pageSize);
      return {
        inViewRef: vi.fn(),
        loaded: true,
        contributions: { total: data.items.length, items, hasMore: items.length < data.items.length, setFetchAll },
      };
    },
  };
});

afterEach(() => {
  gridMock.columnCount = 3;
});

const title = (index: number) => `Contribution ${index + 1}`;

const renderPreview = (type: 'whiteboard' | 'post', total: number) => {
  data.items = Array.from({ length: total }, (_, i) => ({
    id: `contribution-${i + 1}`,
    sortOrder: i,
    [type]: { id: `${type}-${i + 1}`, profile: { displayName: title(i) } },
  }));
  const callout = {
    id: 'callout-1',
    framing: { type: CalloutFramingType.None, profile: { displayName: 'Callout' } },
    settings: {
      framing: { commentsEnabled: true },
      contribution: {
        enabled: true,
        allowedTypes: [type === 'whiteboard' ? CalloutContributionType.Whiteboard : CalloutContributionType.Post],
        canAddContributions: 'NONE',
        commentsEnabled: false,
      },
    },
    contributions: data.items.map(item => ({ id: (item as { id: string }).id })),
  };
  render(<ContributionsPreviewConnector callout={callout as never} />);
};

const shownTitles = (total: number) =>
  Array.from({ length: total }, (_, i) => title(i)).filter(text => screen.queryByText(text));

describe('ContributionsPreviewConnector preview slots', () => {
  it.each([
    [3, 6],
    [2, 4],
    [1, 2],
  ])('shows every contribution and no "more" tile when %i columns fit all %i', (columns, total) => {
    gridMock.columnCount = columns;
    renderPreview('whiteboard', total);

    expect(shownTitles(total)).toHaveLength(total);
    expect(screen.queryByRole('button', { name: /more$/ })).not.toBeInTheDocument();
  });

  it.each([
    // columns, total, cards shown, N in "+N more"
    [3, 7, 5, 2],
    [3, 9, 5, 4],
    [2, 5, 3, 2],
    [2, 9, 3, 6],
    [1, 3, 1, 2],
  ])('with %i columns and %i contributions fills two rows: %i cards and "+%i more"', (columns, total, shown, more) => {
    gridMock.columnCount = columns;
    renderPreview('whiteboard', total);

    expect(shownTitles(total)).toEqual(Array.from({ length: shown }, (_, i) => title(i)));
    expect(screen.getByRole('button', { name: `+${more} more` })).toBeInTheDocument();
  });

  it('puts the dashed "+N more" card in the last slot for posts', () => {
    gridMock.columnCount = 3;
    renderPreview('post', 7);

    expect(shownTitles(7)).toEqual(Array.from({ length: 5 }, (_, i) => title(i)));
    expect(screen.getByRole('button', { name: '+2 more' })).toBeInTheDocument();
  });
});
