import { ApolloError } from '@apollo/client';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
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
  responses: { current: undefined as unknown },
  refetch: vi.fn(),
  submit: vi.fn(),
  remove: vi.fn(),
  refetchQueries: vi.fn(),
  fetchMore: vi.fn(),
  notify: vi.fn(),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutFormResponsesQuery: (options: { skip?: boolean }) =>
    options.skip
      ? { data: undefined, loading: false, refetch: hoisted.refetch, fetchMore: hoisted.fetchMore }
      : { data: hoisted.responses.current, loading: false, refetch: hoisted.refetch, fetchMore: hoisted.fetchMore },
  useCalloutFormResponsesLazyQuery: () => [vi.fn()],
  useSubmitCalloutFormResponseMutation: () => [hoisted.submit, { loading: false }],
  useDeleteCalloutFormResponseMutation: () => [hoisted.remove, { loading: false }],
}));

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useApolloClient: () => ({ refetchQueries: hoisted.refetchQueries }),
}));

vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({ space: { about: { profile: { displayName: 'Garden' } } } }),
}));
vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({ subspace: { about: { profile: { displayName: '' } } } }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => hoisted.notify }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

const { CalloutFramingFormConnector } = await import('./CalloutFramingFormConnector');

const questions = [
  { id: 'q1', prompt: 'Your name', explanation: null, type: CalloutFormQuestionType.ShortText, required: true },
  {
    id: 'q2',
    prompt: 'Colour',
    explanation: null,
    type: CalloutFormQuestionType.SingleChoice,
    required: false,
    options: [
      { id: 'o1', label: 'Red' },
      { id: 'o2', label: 'Blue' },
    ],
  },
];

const makeCallout = (
  settings: Partial<{
    visibility: CalloutFormResponseVisibility;
    responseMode: CalloutFormResponseMode;
    state: CalloutFormState;
    defaultCollapsed: boolean;
  }> = {},
  overrides: {
    draft?: boolean;
    privileges?: AuthorizationPrivilege[];
    title?: string | null;
    description?: string | null;
  } = {}
) =>
  ({
    id: 'callout-1',
    draft: overrides.draft ?? false,
    authorization: { myPrivileges: overrides.privileges ?? [AuthorizationPrivilege.Contribute] },
    framing: {
      type: CalloutFramingType.Form,
      profile: { displayName: 'Intake' },
      form: {
        id: 'form-1',
        title: overrides.title ?? null,
        description: overrides.description ?? null,
        questions,
        settings: {
          visibility: settings.visibility ?? CalloutFormResponseVisibility.Admins,
          responseMode: settings.responseMode ?? CalloutFormResponseMode.Single,
          state: settings.state ?? CalloutFormState.Open,
          defaultCollapsed: settings.defaultCollapsed ?? false,
        },
      },
    },
  }) as unknown as CalloutDetailsModelExtended;

const ownResponse = {
  id: 'r1',
  createdDate: new Date('2026-01-01T10:00:00Z'),
  createdBy: { id: 'me', profile: { id: 'p', displayName: 'Me', url: '/me', avatar: null } },
  answers: [
    {
      questionID: 'q1',
      prompt: 'Your name',
      type: CalloutFormQuestionType.ShortText,
      text: 'Ada',
      selectedOptions: null,
    },
  ],
};

const setResponses = (
  partial: { mine?: unknown[]; canReadAll?: boolean; canModerate?: boolean; total?: number } = {}
) => {
  hoisted.responses.current = {
    lookup: {
      calloutFormResponses: {
        formID: 'form-1',
        canReadAll: partial.canReadAll ?? false,
        canModerate: partial.canModerate ?? false,
        mine: partial.mine ?? [],
        all: {
          total: partial.total ?? 0,
          pageInfo: { hasNextPage: false, endCursor: null },
          responses: [],
        },
      },
    },
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.refetch.mockResolvedValue(undefined);
  hoisted.refetchQueries.mockResolvedValue(undefined);
  hoisted.submit.mockResolvedValue({ data: {} });
  hoisted.remove.mockResolvedValue({ data: {} });
  setResponses();
});

describe('CalloutFramingFormConnector', () => {
  it('SINGLE mode with an own response shows the response and replaces the fill-in', () => {
    setResponses({ mine: [ownResponse] });
    render(<CalloutFramingFormConnector callout={makeCallout()} />);

    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'formFillIn.ownResponses.withdraw' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
  });

  it('MULTIPLE mode shows the own responses and the fill-in together', () => {
    setResponses({ mine: [ownResponse] });
    render(<CalloutFramingFormConnector callout={makeCallout({ responseMode: CalloutFormResponseMode.Multiple })} />);

    expect(screen.getByRole('button', { name: 'formFillIn.ownResponses.withdraw' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'formFillIn.submit' })).toBeInTheDocument();
  });

  it('shows only the fill-in when the viewer has no response yet', () => {
    render(<CalloutFramingFormConnector callout={makeCallout()} />);
    expect(screen.queryByText('formFillIn.ownResponses.heading')).toBeNull();
    expect(screen.getByRole('button', { name: 'formFillIn.submit' })).toBeInTheDocument();
  });

  it.each([
    [CalloutFormResponseVisibility.Admins, 'formFillIn.noticeAdmins', CalloutFormResponseVisibility.Admins],
    [CalloutFormResponseVisibility.Members, 'formFillIn.noticeMembers', CalloutFormResponseVisibility.Members],
  ])('acknowledges exactly the visibility the notice names (%s)', async (visibility, noticeKey, expected) => {
    render(<CalloutFramingFormConnector callout={makeCallout({ visibility })} />);

    expect(screen.getByText(noticeKey)).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: /Your name/ }), 'Ada');
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.submit' }));

    await waitFor(() => expect(hoisted.submit).toHaveBeenCalledTimes(1));
    expect(hoisted.submit.mock.calls[0][0].variables.responseData).toEqual({
      formID: 'form-1',
      acknowledgedVisibility: expected,
      answers: [{ questionID: 'q1', text: 'Ada', selectedOptionIDs: undefined }],
    });
    expect(hoisted.submit.mock.calls[0][0].context).toEqual({ skipGlobalErrorHandler: true });
  });

  it('a visibility change rejection reloads the form and the responses and keeps the draft answers', async () => {
    hoisted.submit.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('rejected', { extensions: { details: { code: 'FORM_VISIBILITY_CHANGED' } } })],
      })
    );
    render(<CalloutFramingFormConnector callout={makeCallout()} />);

    const name = screen.getByRole('textbox', { name: /Your name/ });
    await userEvent.type(name, 'Ada');
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.submit' }));

    await waitFor(() => expect(hoisted.notify).toHaveBeenCalledWith('formFillIn.visibilityChanged', 'warning'));
    expect(hoisted.refetchQueries).toHaveBeenCalledWith(
      expect.objectContaining({ include: ['CalloutDetails'], onQueryUpdated: expect.any(Function) })
    );
    expect(hoisted.refetch).toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveValue('Ada');
  });

  it('other rejections show their localized message and also reload the form', async () => {
    hoisted.submit.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('rejected', { extensions: { details: { code: 'FORM_CLOSED' } } })],
      })
    );
    render(<CalloutFramingFormConnector callout={makeCallout()} />);

    await userEvent.type(screen.getByRole('textbox', { name: /Your name/ }), 'Ada');
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.submit' }));

    await waitFor(() => expect(hoisted.notify).toHaveBeenCalledWith('formFillIn.errors.FORM_CLOSED', 'error'));
    expect(hoisted.refetchQueries).toHaveBeenCalled();
  });

  it('a successful submit toasts, resets the fill-in and refetches the responses', async () => {
    render(<CalloutFramingFormConnector callout={makeCallout({ responseMode: CalloutFormResponseMode.Multiple })} />);

    await userEvent.type(screen.getByRole('textbox', { name: /Your name/ }), 'Ada');
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.submit' }));

    await waitFor(() => expect(hoisted.notify).toHaveBeenCalledWith('formFillIn.success', 'success'));
    expect(hoisted.refetch).toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveValue('');
  });

  it("a rejection refetches only this callout's details, not every callout on the page", async () => {
    hoisted.submit.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('rejected', { extensions: { details: { code: 'FORM_CLOSED' } } })],
      })
    );
    render(<CalloutFramingFormConnector callout={makeCallout()} />);

    await userEvent.type(screen.getByRole('textbox', { name: /Your name/ }), 'Ada');
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.submit' }));

    await waitFor(() => expect(hoisted.refetchQueries).toHaveBeenCalled());
    const { onQueryUpdated } = hoisted.refetchQueries.mock.calls[0][0];
    expect(onQueryUpdated({ variables: { calloutId: 'callout-1' } })).toBe(true);
    expect(onQueryUpdated({ variables: { calloutId: 'callout-2' } })).toBe(false);
  });

  it('single mode: the fill-in stays locked until the own responses reload, then gives way to them', async () => {
    let resolveRefetch: () => void = () => {};
    hoisted.refetch.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveRefetch = () => {
            setResponses({ mine: [ownResponse] });
            resolve();
          };
        })
    );
    render(<CalloutFramingFormConnector callout={makeCallout()} />);

    await userEvent.type(screen.getByRole('textbox', { name: /Your name/ }), 'Ada');
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.submit' }));

    await waitFor(() => expect(hoisted.notify).toHaveBeenCalledWith('formFillIn.success', 'success'));
    // The refetch of `mine` is still in flight: no empty, submittable fill-in in the meantime.
    expect(screen.getByRole('button', { name: 'formFillIn.submitting' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Your name/ })).toHaveValue('Ada');

    resolveRefetch();

    await waitFor(() => expect(screen.queryByRole('button', { name: /formFillIn\.submit/ })).not.toBeInTheDocument());
    expect(screen.queryByRole('textbox', { name: /Your name/ })).not.toBeInTheDocument();
  });

  it('a member with more responses than `mine` holds can load the earlier ones and withdraw them', async () => {
    const response = (id: string) => ({ ...ownResponse, id });
    // `mine` carries only the newest responses; `all` (scoped to the member) counts three.
    setResponses({ mine: [response('r2'), response('r3')], canReadAll: false, total: 3 });
    hoisted.fetchMore.mockResolvedValue({
      data: {
        lookup: {
          calloutFormResponses: {
            all: {
              total: 3,
              pageInfo: { hasNextPage: true, endCursor: 'r2' },
              responses: [response('r1'), response('r2')],
            },
          },
        },
      },
    });
    render(<CalloutFramingFormConnector callout={makeCallout({ responseMode: CalloutFormResponseMode.Multiple })} />);

    expect(screen.getAllByRole('button', { name: 'formFillIn.ownResponses.withdraw' })).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.ownResponses.loadEarlier' }));

    expect(hoisted.fetchMore).toHaveBeenCalledWith({ variables: { formID: 'form-1', first: 50, after: undefined } });
    // r2 arrives in both lists and is shown once; with all three loaded the affordance goes away.
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'formFillIn.ownResponses.withdraw' })).toHaveLength(3)
    );
    expect(screen.queryByRole('button', { name: 'formFillIn.ownResponses.loadEarlier' })).not.toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: 'formFillIn.ownResponses.withdraw' })[0]);
    await userEvent.click(
      await screen.findByRole('button', { name: 'formFillIn.ownResponses.withdrawConfirm.confirm' })
    );
    await waitFor(() =>
      expect(hoisted.remove).toHaveBeenCalledWith(
        expect.objectContaining({ variables: { deleteData: { responseID: 'r1' } } })
      )
    );
  });

  it('offers no earlier-responses paging when `mine` already holds every own response, or to a reader of all', () => {
    setResponses({ mine: [ownResponse], canReadAll: false, total: 1 });
    const { unmount } = render(
      <CalloutFramingFormConnector callout={makeCallout({ responseMode: CalloutFormResponseMode.Multiple })} />
    );
    expect(screen.queryByRole('button', { name: 'formFillIn.ownResponses.loadEarlier' })).not.toBeInTheDocument();
    unmount();

    setResponses({ mine: [ownResponse], canReadAll: true, total: 120 });
    render(<CalloutFramingFormConnector callout={makeCallout({ responseMode: CalloutFormResponseMode.Multiple })} />);
    expect(screen.queryByRole('button', { name: 'formFillIn.ownResponses.loadEarlier' })).not.toBeInTheDocument();
  });

  it('withdrawing an own response deletes it and refetches', async () => {
    setResponses({ mine: [ownResponse] });
    render(<CalloutFramingFormConnector callout={makeCallout()} />);

    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.ownResponses.withdraw' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'formFillIn.ownResponses.withdrawConfirm.confirm' })
    );

    await waitFor(() =>
      expect(hoisted.remove).toHaveBeenCalledWith(
        expect.objectContaining({ variables: { deleteData: { responseID: 'r1' } } })
      )
    );
    await waitFor(() => expect(hoisted.refetch).toHaveBeenCalled());
  });

  it('hides View responses when the viewer cannot read every response', () => {
    setResponses({ canReadAll: false, total: 4 });
    render(<CalloutFramingFormConnector callout={makeCallout()} />);
    expect(screen.queryByRole('button', { name: 'formResponses.viewAction' })).toBeNull();
  });

  it('shows View responses with the total when the viewer can read every response', () => {
    setResponses({ canReadAll: true, total: 4 });
    render(<CalloutFramingFormConnector callout={makeCallout()} />);
    expect(screen.getByRole('button', { name: 'formResponses.viewAction' })).toBeInTheDocument();
  });

  it('a closed form renders read-only with no submit while own responses keep Withdraw', () => {
    setResponses({ mine: [ownResponse] });
    render(
      <CalloutFramingFormConnector
        callout={makeCallout({ state: CalloutFormState.Closed, responseMode: CalloutFormResponseMode.Multiple })}
      />
    );

    expect(screen.getByText('formFillIn.closedBadge')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
    expect(screen.getByRole('button', { name: 'formFillIn.ownResponses.withdraw' })).toBeInTheDocument();
  });

  it('a viewer without the contribute privilege sees the questions but cannot submit', () => {
    render(<CalloutFramingFormConnector callout={makeCallout({}, { privileges: [AuthorizationPrivilege.Read] })} />);
    expect(screen.getByText('formFillIn.cannotRespond')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
  });

  it('an unpublished callout shows the not-published badge and no submit', () => {
    render(<CalloutFramingFormConnector callout={makeCallout({}, { draft: true })} />);
    expect(screen.getByText('formFillIn.draftBadge')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
  });

  it('renders nothing while the responses have not loaded, so a first response is never offered blind', () => {
    hoisted.responses.current = undefined;
    const { container } = render(<CalloutFramingFormConnector callout={makeCallout()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for a callout without a form definition', () => {
    const callout = makeCallout();
    (callout.framing as { form?: unknown }).form = undefined;
    const { container } = render(<CalloutFramingFormConnector callout={callout} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('SINGLE mode with several own responses lists every one with Withdraw and no fill-in', async () => {
    const second = { ...ownResponse, id: 'r2', answers: [{ ...ownResponse.answers[0], text: 'Grace' }] };
    setResponses({ mine: [ownResponse, second] });
    const { rerender } = render(<CalloutFramingFormConnector callout={makeCallout()} />);

    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'formFillIn.ownResponses.withdraw' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();

    // Withdraw the first; the refetch still holds the second: the fill-in stays away.
    await userEvent.click(screen.getAllByRole('button', { name: 'formFillIn.ownResponses.withdraw' })[0]);
    await userEvent.click(
      await screen.findByRole('button', { name: 'formFillIn.ownResponses.withdrawConfirm.confirm' })
    );
    await waitFor(() => expect(hoisted.refetch).toHaveBeenCalledTimes(1));
    setResponses({ mine: [second] });
    rerender(<CalloutFramingFormConnector callout={makeCallout()} />);
    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();

    // Withdraw the last one: once the viewer holds none, the fill-in returns.
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.ownResponses.withdraw' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'formFillIn.ownResponses.withdrawConfirm.confirm' })
    );
    await waitFor(() => expect(hoisted.refetch).toHaveBeenCalledTimes(2));
    setResponses({ mine: [] });
    rerender(<CalloutFramingFormConnector callout={makeCallout()} />);
    expect(screen.getByRole('button', { name: 'formFillIn.submit' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'formFillIn.ownResponses.withdraw' })).toBeNull();
  });

  it('renders the Form box header from the definition: title, description and question count', () => {
    render(
      <CalloutFramingFormConnector
        callout={makeCallout({}, { title: 'Q4 planning', description: 'Tell us where to focus' })}
      />
    );

    expect(screen.getByRole('heading', { name: 'Q4 planning' })).toBeInTheDocument();
    expect(screen.getByText('Tell us where to focus')).toBeInTheDocument();
    expect(screen.getByText('formFillIn.questionCount')).toBeInTheDocument();
  });

  it('an untitled Form shows the generic heading', () => {
    render(<CalloutFramingFormConnector callout={makeCallout()} />);
    expect(screen.getByRole('heading', { name: 'formFillIn.untitled' })).toBeInTheDocument();
  });

  it('a Form collapsed by default starts with the header only', async () => {
    render(<CalloutFramingFormConnector callout={makeCallout({ defaultCollapsed: true })} />);

    expect(screen.queryByRole('button', { name: 'formFillIn.submit' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'formFillIn.expand' }));
    expect(screen.getByRole('button', { name: 'formFillIn.submit' })).toBeInTheDocument();
  });

  it('the review dialog carries the Form title as heading context', async () => {
    setResponses({ canReadAll: true, total: 1 });
    render(<CalloutFramingFormConnector callout={makeCallout({}, { title: 'Q4 planning' })} />);

    await userEvent.click(screen.getByRole('button', { name: 'formResponses.viewAction' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Q4 planning')).toBeInTheDocument();
  });

  it('the review dialog offers Export CSV at the bottom, disabled while there is nothing to export', async () => {
    setResponses({ canReadAll: true, total: 1 });
    const { unmount } = render(<CalloutFramingFormConnector callout={makeCallout()} />);
    await userEvent.click(screen.getByRole('button', { name: 'formResponses.viewAction' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'formResponses.exportCsv' })).toBeEnabled();
    unmount();

    setResponses({ canReadAll: true, total: 0 });
    render(<CalloutFramingFormConnector callout={makeCallout()} />);
    await userEvent.click(screen.getByRole('button', { name: 'formResponses.viewAction' }));
    const emptyDialog = await screen.findByRole('dialog');
    expect(within(emptyDialog).getByRole('button', { name: 'formResponses.exportCsv' })).toBeDisabled();
  });
});
