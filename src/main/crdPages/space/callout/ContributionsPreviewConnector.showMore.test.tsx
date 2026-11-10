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

// jsdom has no grid layout: render the two-column grid, whose two rows hold 3 cards + "+3 more".
vi.mock('@/crd/hooks/useGridColumnCount', () => ({
  useGridColumnCount: () => [2, () => {}],
}));

const TOTAL = 6;
const whiteboards = Array.from({ length: TOTAL }, (_, i) => ({
  id: `contribution-${i + 1}`,
  sortOrder: i,
  whiteboard: { id: `whiteboard-${i + 1}`, profile: { displayName: `Sprint review ${i + 1}` } },
}));

// Mirrors the real hook's page contract: the first `pageSize` items until `setFetchAll(true)`.
vi.mock('@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions', async () => {
  const { useState } = await import('react');
  return {
    default: ({ pageSize }: { pageSize?: number }) => {
      const [fetchAll, setFetchAll] = useState(false);
      return {
        inViewRef: vi.fn(),
        loaded: true,
        contributions: {
          total: TOTAL,
          items: fetchAll ? whiteboards : whiteboards.slice(0, pageSize),
          hasMore: !fetchAll,
          setFetchAll,
        },
      };
    },
  };
});

const callout = {
  id: 'callout-1',
  framing: { type: CalloutFramingType.None, profile: { displayName: 'Sprint reviews' } },
  settings: {
    framing: { commentsEnabled: true },
    contribution: {
      enabled: true,
      allowedTypes: [CalloutContributionType.Whiteboard],
      canAddContributions: 'NONE',
      commentsEnabled: false,
    },
  },
  contributions: whiteboards.map(({ id }) => ({ id })),
};

describe('ContributionsPreviewConnector show more', () => {
  it('reveals the remaining contributions inline instead of opening the detail dialog', async () => {
    const user = userEvent.setup();
    const onContributionClick = vi.fn();

    render(<ContributionsPreviewConnector callout={callout as never} onContributionClick={onContributionClick} />);

    expect(screen.queryByText('Sprint review 4')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '+3 more' }));

    for (const { whiteboard } of whiteboards) {
      expect(screen.getByText(whiteboard.profile.displayName)).toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: '+3 more' })).not.toBeInTheDocument();
    expect(onContributionClick).not.toHaveBeenCalled();
  });
});
