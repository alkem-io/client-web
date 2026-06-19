import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const sendDirectMessageMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSendDirectMessageToUsersMutation: () => [sendDirectMessageMock, { loading: false }],
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
