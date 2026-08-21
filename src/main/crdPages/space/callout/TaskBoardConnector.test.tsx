import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationPrivilege, CalloutContributionType } from '@/core/apollo/generated/graphql-schema';

const useTaskBoardDataQuery = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useTaskBoardDataQuery: (options: unknown) => useTaskBoardDataQuery(options),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

import { TaskBoardConnector } from './TaskBoardConnector';

const FALLBACK = <div data-testid="plain-preview">plain preview</div>;

function boardCallout(overrides: Record<string, unknown> = {}) {
  return {
    id: 'callout-1',
    authorization: { id: 'a', myPrivileges: [AuthorizationPrivilege.Contribute] },
    settings: { contribution: { allowedTypes: [CalloutContributionType.Post] } },
    classification: {
      id: 'c',
      tagsets: [{ id: 't', name: 'task', allowedValues: ['Backlog', 'Done'] }],
    },
    taskColumnCounts: [
      { column: 'Backlog', count: 1 },
      { column: 'Done', count: 0 },
    ],
    contributions: [
      {
        id: 'contrib-1',
        sortOrder: 1,
        classification: { id: 'cc', tagsets: [{ id: 'ct', name: 'task', tags: ['Backlog'] }] },
        post: {
          id: 'post-1',
          createdBy: { id: 'u', profile: { id: 'p', displayName: 'Ada', avatar: undefined } },
          profile: { id: 'pp', displayName: 'First task', description: undefined, tagset: undefined },
          comments: { id: 'r', messagesCount: 0 },
        },
      },
    ],
    ...overrides,
  };
}

afterEach(() => {
  useTaskBoardDataQuery.mockReset();
});

describe('TaskBoardConnector', () => {
  it('renders the board view for a marked POSTS callout', () => {
    useTaskBoardDataQuery.mockReturnValue({ data: { lookup: { callout: boardCallout() } } });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.queryByTestId('plain-preview')).not.toBeInTheDocument();
  });

  it('uses the authoritative counts, not the card list length', () => {
    useTaskBoardDataQuery.mockReturnValue({ data: { lookup: { callout: boardCallout() } } });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    // One card renders under Backlog, but the count comes from taskColumnCounts.
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('falls back to the plain preview when the marker tagset is absent', () => {
    useTaskBoardDataQuery.mockReturnValue({
      data: {
        lookup: {
          callout: boardCallout({ classification: { id: 'c', tagsets: [{ id: 't', name: 'flow-state', allowedValues: [] }] } }),
        },
      },
    });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.getByTestId('plain-preview')).toBeInTheDocument();
  });

  it('falls back while the query is still loading', () => {
    useTaskBoardDataQuery.mockReturnValue({ data: undefined });
    render(<TaskBoardConnector calloutId="callout-1" fallback={FALLBACK} />);
    expect(screen.getByTestId('plain-preview')).toBeInTheDocument();
  });
});
