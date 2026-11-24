import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

vi.mock('react-i18next', async importOriginal => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const sendDirectMessageMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSendDirectMessageToUsersMutation: () => [sendDirectMessageMock, { loading: false }],
  useUserSelectorQuery: () => ({ data: undefined, loading: false }),
}));

vi.mock('@/core/apollo/generated/graphql-schema', () => ({
  DirectMessageDeliveryStatus: { Sent: 'SENT', BlockedNoConsent: 'BLOCKED_NO_CONSENT', Failed: 'FAILED' },
}));

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notifyMock,
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'me' } }),
}));

const setIsOpenMock = vi.fn();
const setSelectedConversationIdMock = vi.fn();
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    setIsOpen: setIsOpenMock,
    setSelectedConversationId: setSelectedConversationIdMock,
  }),
}));

// Render a minimal UserSelector that just shows selected users; selection is
// driven directly via the form state in these tests by pre-seeding through the
// search-results path is unnecessary — we expose the selected chips only.
vi.mock('@/crd/forms/UserSelector', () => ({
  UserSelector: ({
    selectedUsers,
    onSelect,
  }: {
    selectedUsers: { id: string; displayName: string }[];
    onSelect: (u: { id: string; displayName: string }) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onSelect({ id: 'u1', displayName: 'Alice' })}>
        add-alice
      </button>
      <button type="button" onClick={() => onSelect({ id: 'u2', displayName: 'Bob' })}>
        add-bob
      </button>
      <div data-testid="selected">{selectedUsers.map(u => u.id).join(',')}</div>
    </div>
  ),
}));

vi.mock('@/crd/components/chat/SendConfirmationDialog', () => ({
  SendConfirmationDialog: ({
    open,
    notReached,
    onOpenChat,
    onOpenChange,
  }: {
    open: boolean;
    notReached?: string[];
    onOpenChat?: () => void;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="confirmation">
        notReached:{(notReached ?? []).join(',')}
        {onOpenChat ? (
          <button type="button" onClick={onOpenChat}>
            open-chat
          </button>
        ) : null}
        <button type="button" onClick={() => onOpenChange(false)}>
          dismiss-confirmation
        </button>
      </div>
    ) : null,
}));

import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import '@/core/i18n/config';
import commonEN from '@/crd/i18n/common/common.en.json';
import { CalloutShareOnAlkemioForm } from './CalloutShareOnAlkemioForm';

describe('CalloutShareOnAlkemioForm (US2 — Share on Alkemio → individual chats)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('sends once with all recipient ids and shows the confirmation', async () => {
    sendDirectMessageMock.mockResolvedValue({
      data: {
        sendDirectMessageToUsers: [
          { receiverID: 'u1', status: 'SENT', conversationID: 'c1' },
          { receiverID: 'u2', status: 'SENT', conversationID: 'c2' },
        ],
      },
    });

    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" />);

    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('add-bob'));
    expect(screen.getByTestId('selected').textContent).toBe('u1,u2');

    fireEvent.click(screen.getByText('share.alkemio.send'));
    await vi.waitFor(() => expect(sendDirectMessageMock).toHaveBeenCalledTimes(1));

    const callArg = sendDirectMessageMock.mock.calls[0][0];
    expect(callArg.variables.messageData.receiverIDs).toEqual(['u1', 'u2']);

    await vi.waitFor(() => expect(screen.getByTestId('confirmation')).toBeTruthy());
    expect(screen.getByTestId('confirmation').textContent).toContain('notReached:');
    expect(screen.getByTestId('confirmation').textContent).not.toContain('Alice');
    expect(screen.getByTestId('confirmation').textContent).not.toContain('Bob');
  });

  test('partial failure lists the not-reached recipients', async () => {
    sendDirectMessageMock.mockResolvedValue({
      data: {
        sendDirectMessageToUsers: [
          { receiverID: 'u1', status: 'SENT', conversationID: 'c1' },
          { receiverID: 'u2', status: 'BLOCKED_NO_CONSENT', conversationID: null },
        ],
      },
    });

    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" />);

    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('add-bob'));
    fireEvent.click(screen.getByText('share.alkemio.send'));

    await vi.waitFor(() => expect(screen.getByTestId('confirmation')).toBeTruthy());
    expect(screen.getByTestId('confirmation').textContent).toContain('notReached:Bob');
  });

  test('open chat after multiple recipients opens the conversation list and closes the share dialog', async () => {
    sendDirectMessageMock.mockResolvedValue({
      data: {
        sendDirectMessageToUsers: [
          { receiverID: 'u1', status: 'SENT', conversationID: 'c1' },
          { receiverID: 'u2', status: 'SENT', conversationID: 'c2' },
        ],
      },
    });
    const onClose = vi.fn();

    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" onClose={onClose} />);

    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('add-bob'));
    fireEvent.click(screen.getByText('share.alkemio.send'));

    await vi.waitFor(() => expect(screen.getByText('open-chat')).toBeTruthy());
    fireEvent.click(screen.getByText('open-chat'));

    expect(setSelectedConversationIdMock).toHaveBeenCalledWith(null);
    expect(setIsOpenMock).toHaveBeenCalledWith(true);
    expect(onClose).toHaveBeenCalled();
  });

  test('dismissing the confirmation closes the share dialog', async () => {
    sendDirectMessageMock.mockResolvedValue({
      data: { sendDirectMessageToUsers: [{ receiverID: 'u1', status: 'SENT', conversationID: 'c1' }] },
    });
    const onClose = vi.fn();

    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" onClose={onClose} />);

    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('share.alkemio.send'));

    await vi.waitFor(() => expect(screen.getByText('dismiss-confirmation')).toBeTruthy());
    fireEvent.click(screen.getByText('dismiss-confirmation'));

    // Single recipient → that conversation is focused; share dialog closes.
    expect(setSelectedConversationIdMock).not.toHaveBeenCalledWith(null);
    expect(onClose).toHaveBeenCalled();
  });
});

describe('CalloutShareOnAlkemioForm — hourly message allowance used up', () => {
  const send = async () => {
    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" />);
    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('share.alkemio.send'));
    await vi.waitFor(() => expect(sendDirectMessageMock).toHaveBeenCalledTimes(1));
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('sends without the global error handler', async () => {
    sendDirectMessageMock.mockResolvedValue({ data: { sendDirectMessageToUsers: [] } });

    await send();

    expect(sendDirectMessageMock.mock.calls[0][0].context).toEqual({ skipGlobalErrorHandler: true });
  });

  test('a limit refusal raises exactly one notification, with the limit text', async () => {
    sendDirectMessageMock.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('refused', { extensions: { code: 'MESSAGE_SEND_LIMIT_REACHED' } })],
      })
    );

    await send();

    await vi.waitFor(() => expect(notifyMock).toHaveBeenCalled());
    expect(notifyMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledWith(
      commonEN.apollo.errors.userMessages.operations.messageSendLimitReached,
      'error'
    );
  });

  test('another failure raises exactly one notification, with the send-failed text', async () => {
    sendDirectMessageMock.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('Something failed', { extensions: { code: 'UNSPECIFIED' } })],
      })
    );

    await send();

    await vi.waitFor(() => expect(notifyMock).toHaveBeenCalled());
    expect(notifyMock).toHaveBeenCalledTimes(1);
    expect(notifyMock).toHaveBeenCalledWith('share.alkemio.errors.sendFailed', 'error');
  });
});
