import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AuthorizationPrivilege,
  CalloutFormQuestionType,
  CalloutFormResponseMode,
  CalloutFormResponseVisibility,
  CalloutFormState,
  CalloutFramingType,
} from '@/core/apollo/generated/graphql-schema';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';

const hoisted = vi.hoisted(() => ({
  fetchMore: vi.fn(),
  refetch: vi.fn(),
  remove: vi.fn(),
  reviewQueryOptions: [] as unknown[],
}));

const makeResponse = (index: number) => ({
  id: `r${index}`,
  createdDate: new Date(2026, 0, 1 + (index % 28)),
  createdBy: { id: `u${index}`, profile: { id: `p${index}`, displayName: `User ${index}`, url: '/u', avatar: null } },
  answers: [
    {
      questionID: 'q1',
      prompt: 'Your name',
      type: CalloutFormQuestionType.ShortText,
      text: `Name ${index}`,
      selectedOptions: null,
    },
  ],
});

const page = (from: number, count: number, hasNextPage: boolean, total: number) => ({
  lookup: {
    calloutFormResponses: {
      formID: 'form-1',
      canReadAll: true,
      canModerate: true,
      mine: [],
      all: {
        total,
        pageInfo: { hasNextPage, endCursor: hasNextPage ? `cursor-${from + count}` : null },
        responses: Array.from({ length: count }, (_, i) => makeResponse(from + i)),
      },
    },
  },
});

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutFormResponsesQuery: (options: { skip?: boolean; variables: { first: number } }) => {
    if (options.variables.first === 1) {
      return { data: page(0, 0, false, 120), loading: false, refetch: hoisted.refetch, fetchMore: vi.fn() };
    }
    hoisted.reviewQueryOptions.push(options);
    return {
      data: options.skip ? undefined : page(0, 50, true, 120),
      loading: false,
      refetch: hoisted.refetch,
      fetchMore: hoisted.fetchMore,
    };
  },
  useSubmitCalloutFormResponseMutation: () => [vi.fn(), { loading: false }],
  useDeleteCalloutFormResponseMutation: () => [hoisted.remove, { loading: false }],
}));
vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useApolloClient: () => ({ refetchQueries: vi.fn() }),
}));
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({ space: { about: { profile: { displayName: 'Garden' } } } }),
}));
vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({ subspace: { about: { profile: { displayName: '' } } } }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

const { CalloutFramingFormConnector } = await import('./CalloutFramingFormConnector');

const callout = {
  id: 'callout-1',
  draft: false,
  authorization: { myPrivileges: [AuthorizationPrivilege.Contribute] },
  framing: {
    type: CalloutFramingType.Form,
    profile: { displayName: 'Intake' },
    form: {
      id: 'form-1',
      questions: [
        { id: 'q1', prompt: 'Your name', explanation: null, type: CalloutFormQuestionType.ShortText, required: true },
      ],
      settings: {
        visibility: CalloutFormResponseVisibility.Admins,
        responseMode: CalloutFormResponseMode.Single,
        state: CalloutFormState.Open,
      },
    },
  },
} as unknown as CalloutDetailsModelExtended;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.reviewQueryOptions.length = 0;
  hoisted.remove.mockResolvedValue({ data: {} });
  hoisted.refetch.mockResolvedValue(undefined);
});

describe('CalloutFramingFormConnector — review dialog', () => {
  it('does not load the responses until the dialog is opened', () => {
    render(<CalloutFramingFormConnector callout={callout} />);
    expect(hoisted.reviewQueryOptions.every(o => (o as { skip?: boolean }).skip)).toBe(true);
  });

  it('opens with the first page, loads the next page by cursor and appends it', async () => {
    hoisted.fetchMore.mockResolvedValue({ data: page(50, 50, true, 120) });
    render(<CalloutFramingFormConnector callout={callout} />);

    await userEvent.click(screen.getByRole('button', { name: 'formResponses.viewAction' }));
    expect(await screen.findAllByRole('row')).toHaveLength(51);

    await userEvent.click(screen.getByRole('button', { name: 'formResponses.loadMore' }));

    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(101));
    expect(hoisted.fetchMore).toHaveBeenCalledWith({ variables: { formID: 'form-1', first: 50, after: 'cursor-50' } });
    expect(screen.getByRole('button', { name: 'formResponses.loadMore' })).toBeInTheDocument();
  });

  it('opens a single response and deletes it after confirming, then reloads from page one', async () => {
    render(<CalloutFramingFormConnector callout={callout} />);
    await userEvent.click(screen.getByRole('button', { name: 'formResponses.viewAction' }));
    await screen.findAllByRole('row');

    await userEvent.click(screen.getAllByRole('button', { name: 'formResponses.open' })[0]);
    expect(await screen.findByText('formResponses.singleTitle')).toBeInTheDocument();
    expect(screen.getAllByText('Name 0').length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: 'formResponses.delete' }));
    const confirm = await screen.findByRole('alertdialog');
    await userEvent.click(within(confirm).getByRole('button', { name: 'formResponses.deleteConfirm.confirm' }));

    await waitFor(() =>
      expect(hoisted.remove).toHaveBeenCalledWith(
        expect.objectContaining({ variables: { deleteData: { responseID: 'r0' } } })
      )
    );
  });
});
