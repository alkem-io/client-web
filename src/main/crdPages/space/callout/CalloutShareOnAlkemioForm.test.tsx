import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

vi.mock('react-i18next', () => ({
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
  SendConfirmationDialog: ({ open, notReached }: { open: boolean; notReached?: string[] }) =>
    open ? <div data-testid="confirmation">notReached:{(notReached ?? []).join(',')}</div> : null,
}));

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
    expect(screen.getByTestId('confirmation').textContent).toBe('notReached:');
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
    expect(screen.getByTestId('confirmation').textContent).toBe('notReached:Bob');
  });
});
