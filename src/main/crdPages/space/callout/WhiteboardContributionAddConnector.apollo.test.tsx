/** @vitest-environment jsdom */
import { ApolloClient, ApolloLink, ApolloProvider, gql, InMemoryCache, Observable, useQuery } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { WhiteboardContributionAddConnector } from './WhiteboardContributionAddConnector';

const state = vi.hoisted(() => ({
  handleApolloError: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({
  useApolloErrorHandler: () => state.handleApolloError,
}));

type OperationCounts = Record<string, number>;

const CalloutDetailsQuery = gql`
  query CalloutDetails {
    platform {
      id
    }
  }
`;

const CalloutContributionsQuery = gql`
  query CalloutContributions {
    platform {
      id
    }
  }
`;

function ActiveCalloutDetails() {
  const { error, loading } = useQuery(CalloutDetailsQuery);
  useQuery(CalloutContributionsQuery);
  return <div data-testid="callout-details-state">{loading ? 'loading' : error ? 'error' : 'ready'}</div>;
}

function CreateWhiteboardHarness({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(true);
  const [created, setCreated] = useState(false);

  return (
    <>
      <ActiveCalloutDetails />
      <WhiteboardContributionAddConnector
        calloutId="callout-1"
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          onCreated();
          setCreated(true);
        }}
      />
      {created && <div data-testid="create-succeeded" />}
    </>
  );
}

function createClient(counts: OperationCounts) {
  const link = new ApolloLink(operation => {
    counts[operation.operationName] = (counts[operation.operationName] ?? 0) + 1;

    return new Observable(observer => {
      if (operation.operationName === 'CalloutDetails') {
        if (counts.CalloutDetails === 1) {
          observer.next({ data: { platform: { __typename: 'Platform', id: 'platform-1' } } });
          observer.complete();
          return;
        }

        const timer = window.setTimeout(() => observer.error(new Error('refetch unavailable')));
        return () => window.clearTimeout(timer);
      }

      if (operation.operationName === 'CalloutContributions') {
        observer.next({ data: { platform: { __typename: 'Platform', id: 'platform-1' } } });
        observer.complete();
        return;
      }

      if (operation.operationName === 'CreateWhiteboardOnCallout') {
        observer.next({
          data: {
            createContributionOnCallout: {
              __typename: 'CalloutContribution',
              whiteboard: null,
            },
          },
        });
        observer.complete();
        return;
      }

      observer.error(new Error(`Unexpected ${operation.operationName} operation`));
    });
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });
}

describe('WhiteboardContributionAddConnector Apollo boundary', () => {
  it('completes a successful create when an active named refetch fails after the create committed', async () => {
    const user = userEvent.setup();
    const counts: OperationCounts = {};
    const onCreated = vi.fn();
    const unhandledRejection = vi.fn();
    const client = createClient(counts);
    window.addEventListener('unhandledrejection', unhandledRejection);
    state.handleApolloError.mockReset();

    try {
      render(
        <ApolloProvider client={client}>
          <CreateWhiteboardHarness onCreated={onCreated} />
        </ApolloProvider>
      );

      await waitFor(() => expect(screen.getByTestId('callout-details-state')).toHaveTextContent('ready'));
      await user.click(screen.getByRole('button', { name: 'dialogs.create' }));

      await waitFor(() => expect(screen.getByTestId('create-succeeded')).toBeInTheDocument());
      expect(onCreated).toHaveBeenCalledOnce();
      expect(counts.CreateWhiteboardOnCallout).toBe(1);
      expect(state.handleApolloError).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await waitFor(() => expect(counts.CalloutDetails).toBe(2));
      await waitFor(() => expect(screen.getByTestId('callout-details-state')).toHaveTextContent('error'));
      expect(unhandledRejection).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('unhandledrejection', unhandledRejection);
    }
  });
});
