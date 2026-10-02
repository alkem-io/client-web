import { ApolloError } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
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
  notify: vi.fn(),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutFormResponsesQuery: (options: { skip?: boolean }) =>
    options.skip
      ? { data: undefined, loading: false, refetch: hoisted.refetch, fetchMore: vi.fn() }
      : { data: hoisted.responses.current, loading: false, refetch: hoisted.refetch, fetchMore: vi.fn() },
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
  }> = {},
  overrides: { draft?: boolean; privileges?: AuthorizationPrivilege[] } = {}
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
        questions,
        settings: {
          visibility: settings.visibility ?? CalloutFormResponseVisibility.Admins,
          responseMode: settings.responseMode ?? CalloutFormResponseMode.Single,
          state: settings.state ?? CalloutFormState.Open,
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
    expect(hoisted.refetchQueries).toHaveBeenCalledWith({ include: ['CalloutDetails'] });
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
});
