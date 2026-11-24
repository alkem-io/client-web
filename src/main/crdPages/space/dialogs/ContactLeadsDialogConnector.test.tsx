import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

vi.mock('react-i18next', async importOriginal => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { exists: () => false },
  }),
}));

const sendDirectMessageMock = vi.fn();
const sendDirectMessageOptions = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSendDirectMessageToUsersMutation: (options: unknown) => {
    sendDirectMessageOptions(options);
    return [sendDirectMessageMock, { loading: false }];
  },
}));

vi.mock('@/core/apollo/generated/graphql-schema', () => ({
  DirectMessageDeliveryStatus: { Sent: 'SENT', BlockedNoConsent: 'BLOCKED_NO_CONSENT', Failed: 'FAILED' },
}));

vi.mock('@/core/ui/forms/field-length.constants', () => ({ LONG_TEXT_LENGTH: 4000 }));

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));

const setIsOpenMock = vi.fn();
const setSelectedConversationIdMock = vi.fn();
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    setIsOpen: setIsOpenMock,
    setSelectedConversationId: setSelectedConversationIdMock,
  }),
}));

import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import i18next from 'i18next';
import '@/core/i18n/config';
import commonEN from '@/crd/i18n/common/common.en.json';
import commonNL from '@/crd/i18n/common/common.nl.json';
import { ContactLeadsDialogConnector } from './ContactLeadsDialogConnector';

const recipients = [
  { id: 'l1', displayName: 'Lead One' },
  { id: 'l2', displayName: 'Lead Two' },
];

describe('ContactLeadsDialog (US3 — Contact the leads → individual chats)', () => {
  afterEach(() => vi.clearAllMocks());

  test('renders the exact explanatory copy key', () => {
    render(<ContactLeadsDialogConnector open={true} onOpenChange={vi.fn()} recipients={recipients} />);
    expect(screen.getByText('contactLeads.explanation')).toBeTruthy();
  });

  test('fans out to all lead ids in a single mutation call', async () => {
    sendDirectMessageMock.mockResolvedValue({
      data: {
        sendDirectMessageToUsers: [
          { receiverID: 'l1', status: 'SENT', conversationID: 'c1' },
          { receiverID: 'l2', status: 'SENT', conversationID: 'c2' },
        ],
      },
    });

    render(<ContactLeadsDialogConnector open={true} onOpenChange={vi.fn()} recipients={recipients} />);

    fireEvent.change(screen.getByLabelText('contactLeads.messageLabel'), { target: { value: 'hello leads' } });
    fireEvent.click(screen.getByText('contactLeads.send'));

    await vi.waitFor(() => expect(sendDirectMessageMock).toHaveBeenCalledTimes(1));
    expect(sendDirectMessageMock.mock.calls[0][0].variables.messageData.receiverIDs).toEqual(['l1', 'l2']);
    expect(sendDirectMessageMock.mock.calls[0][0].variables.messageData.message).toBe('hello leads');
  });

  test('open chat after messaging multiple leads opens the conversation list, not a single thread', async () => {
    sendDirectMessageMock.mockResolvedValue({
      data: {
        sendDirectMessageToUsers: [
          { receiverID: 'l1', status: 'SENT', conversationID: 'c1' },
          { receiverID: 'l2', status: 'SENT', conversationID: 'c2' },
        ],
      },
    });

    render(<ContactLeadsDialogConnector open={true} onOpenChange={vi.fn()} recipients={recipients} />);

    fireEvent.change(screen.getByLabelText('contactLeads.messageLabel'), { target: { value: 'hi' } });
    fireEvent.click(screen.getByText('contactLeads.send'));

    await vi.waitFor(() => expect(screen.getByText('sendConfirmation.openChat')).toBeTruthy());
    fireEvent.click(screen.getByText('sendConfirmation.openChat'));

    expect(setSelectedConversationIdMock).toHaveBeenCalledWith(null);
    expect(setIsOpenMock).toHaveBeenCalledWith(true);
  });

  test('open chat after messaging a single lead focuses that conversation', async () => {
    sendDirectMessageMock.mockResolvedValue({
      data: { sendDirectMessageToUsers: [{ receiverID: 'l1', status: 'SENT', conversationID: 'c1' }] },
    });

    render(<ContactLeadsDialogConnector open={true} onOpenChange={vi.fn()} recipients={[recipients[0]]} />);

    fireEvent.change(screen.getByLabelText('contactLeads.messageLabel'), { target: { value: 'hi' } });
    fireEvent.click(screen.getByText('contactLeads.send'));

    await vi.waitFor(() => expect(screen.getByText('sendConfirmation.openChat')).toBeTruthy());
    fireEvent.click(screen.getByText('sendConfirmation.openChat'));

    expect(setSelectedConversationIdMock).toHaveBeenCalledWith('c1');
    expect(setIsOpenMock).toHaveBeenCalledWith(true);
  });

  test('shows confirmation listing not-reached leads on partial failure', async () => {
    sendDirectMessageMock.mockResolvedValue({
      data: {
        sendDirectMessageToUsers: [
          { receiverID: 'l1', status: 'SENT', conversationID: 'c1' },
          { receiverID: 'l2', status: 'FAILED', conversationID: null },
        ],
      },
    });

    render(<ContactLeadsDialogConnector open={true} onOpenChange={vi.fn()} recipients={recipients} />);

    fireEvent.change(screen.getByLabelText('contactLeads.messageLabel'), { target: { value: 'hi' } });
    fireEvent.click(screen.getByText('contactLeads.send'));

    await vi.waitFor(() => expect(screen.getByText('Lead Two')).toBeTruthy());
  });
});

describe('ContactLeadsDialogConnector — hourly message allowance used up', () => {
  const limitError = () =>
    new ApolloError({
      graphQLErrors: [new GraphQLError('refused', { extensions: { code: 'MESSAGE_SEND_LIMIT_REACHED' } })],
    });

  const send = async () => {
    render(<ContactLeadsDialogConnector open={true} onOpenChange={vi.fn()} recipients={recipients} />);
    fireEvent.change(screen.getByLabelText('contactLeads.messageLabel'), { target: { value: 'hi' } });
    fireEvent.click(screen.getByText('contactLeads.send'));
    await vi.waitFor(() => expect(notifyMock).toHaveBeenCalled());
  };

  afterEach(async () => {
    vi.clearAllMocks();
    await i18next.changeLanguage('en');
  });

  test('sends without the global error handler', async () => {
    sendDirectMessageMock.mockResolvedValue({ data: { sendDirectMessageToUsers: [] } });

    render(<ContactLeadsDialogConnector open={true} onOpenChange={vi.fn()} recipients={recipients} />);
    fireEvent.change(screen.getByLabelText('contactLeads.messageLabel'), { target: { value: 'hi' } });
    fireEvent.click(screen.getByText('contactLeads.send'));

    await vi.waitFor(() => expect(sendDirectMessageMock).toHaveBeenCalledTimes(1));
    expect(sendDirectMessageMock.mock.calls[0][0].context).toEqual({ skipGlobalErrorHandler: true });
  });

  test('a limit refusal raises exactly one notification, with the limit text', async () => {
    sendDirectMessageMock.mockRejectedValue(limitError());

    await send();

    expect(notifyMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledWith(
      commonEN.apollo.errors.userMessages.operations.messageSendLimitReached,
      'error'
    );
  });

  test('the limit text follows the active language', async () => {
    await i18next.changeLanguage('nl');
    sendDirectMessageMock.mockRejectedValue(limitError());

    await send();

    expect(notifyMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledWith(
      commonNL.apollo.errors.userMessages.operations.messageSendLimitReached,
      'error'
    );
  });

  test("another refusal raises exactly one notification, with the server's reason", async () => {
    sendDirectMessageMock.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('Something failed', { extensions: { code: 'OPERATION_NOT_ALLOWED' } })],
      })
    );

    await send();

    expect(notifyMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledWith(expect.stringContaining('Something failed'), 'error');
  });

  test('a failure without a server answer raises exactly one notification, with the send-failed text', async () => {
    sendDirectMessageMock.mockRejectedValue(new ApolloError({ networkError: new Error('Failed to fetch') }));

    await send();

    expect(notifyMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledWith('contactLeads.errors.sendFailed', 'error');
  });
});
