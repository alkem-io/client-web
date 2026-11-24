import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

// The link edit dialog runs Apollo mutations; it plays no part in the preview's "+N more".
vi.mock('./LinkContributionEditConnector', () => ({ LinkContributionEditConnector: () => null }));

// jsdom has no grid layout: force the column count the preview grid reads.
const gridMock = vi.hoisted(() => ({ columnCount: 2 }));
vi.mock('@/crd/hooks/useGridColumnCount', () => ({
  useGridColumnCount: () => [gridMock.columnCount, () => {}],
}));

const data = vi.hoisted(() => ({ items: [] as unknown[], failedFullFetches: 0 }));

// Mirrors the real hook's page contract: the first `pageSize` items until `setFetchAll(true)` succeeds.
// A failed full fetch keeps the first page and still reports `hasMore`; `setFetchAll(true)` again retries.
vi.mock('@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions', async () => {
  const { useState } = await import('react');
  return {
    default: ({ pageSize }: { pageSize?: number }) => {
      const [fetchedAll, setFetchedAll] = useState(false);
      const setFetchAll = () => {
        if (data.failedFullFetches > 0) {
          data.failedFullFetches -= 1;
          return;
        }
        setFetchedAll(true);
      };
      const items = fetchedAll ? data.items : data.items.slice(0, pageSize);
      return {
        inViewRef: vi.fn(),
        loaded: true,
        contributions: { total: data.items.length, items, hasMore: items.length < data.items.length, setFetchAll },
      };
    },
  };
});

const title = (index: number) => `Sprint review ${index + 1}`;

const renderPreview = (type: 'whiteboard' | 'link', total: number) => {
  data.items = Array.from({ length: total }, (_, i) => ({
    id: `contribution-${i + 1}`,
    sortOrder: i,
    [type]:
      type === 'link'
        ? { id: `link-${i + 1}`, uri: `https://example.com/${i + 1}`, profile: { displayName: title(i) } }
        : { id: `whiteboard-${i + 1}`, profile: { displayName: title(i) } },
  }));
  const callout = {
    id: 'callout-1',
    framing: { type: CalloutFramingType.None, profile: { displayName: 'Sprint reviews' } },
    settings: {
      framing: { commentsEnabled: true },
      contribution: {
        enabled: true,
        allowedTypes: [type === 'link' ? CalloutContributionType.Link : CalloutContributionType.Whiteboard],
        canAddContributions: 'NONE',
        commentsEnabled: false,
      },
    },
    contributions: data.items.map(item => ({ id: (item as { id: string }).id })),
  };
  const onContributionClick = vi.fn();
  render(<ContributionsPreviewConnector callout={callout as never} onContributionClick={onContributionClick} />);
  return onContributionClick;
};

const shownTitles = (total: number) =>
  Array.from({ length: total }, (_, i) => title(i)).filter(text => screen.queryByText(text));

describe('ContributionsPreviewConnector show more', () => {
  it('reveals the remaining contributions inline instead of opening the detail dialog', async () => {
    const user = userEvent.setup();
    gridMock.columnCount = 2;
    data.failedFullFetches = 0;
    const onContributionClick = renderPreview('whiteboard', 6);

    expect(screen.queryByText(title(3))).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '+3 more' }));

    expect(shownTitles(6)).toHaveLength(6);
    expect(screen.queryByRole('button', { name: '+3 more' })).not.toBeInTheDocument();
    expect(onContributionClick).not.toHaveBeenCalled();
  });

  it.each([
    // type, "+N more" label, items shown while the full request has failed
    ['whiteboard', '+4 more', 5],
    ['link', '+6 more', 3],
  ] as const)('keeps the %s preview\'s "%s" to retry a failed full request', async (type, moreLabel, shownBeforeRetry) => {
    const user = userEvent.setup();
    gridMock.columnCount = 3;
    data.failedFullFetches = 1;
    renderPreview(type, 9);

    await user.click(screen.getByRole('button', { name: moreLabel }));

    expect(shownTitles(9)).toHaveLength(shownBeforeRetry);
    await user.click(screen.getByRole('button', { name: moreLabel }));

    expect(shownTitles(9)).toHaveLength(9);
    expect(screen.queryByRole('button', { name: /more$/ })).not.toBeInTheDocument();
  });
});
