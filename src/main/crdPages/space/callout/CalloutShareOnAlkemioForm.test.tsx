import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/hooks/useReportedQueryError', () => ({ useReportedQueryError: () => {} }));
vi.mock('@/main/crdPages/unifiedChat/useChatRecipientDirectory', () => ({
  useChatRecipientDirectory: () => ({ searchResults: [], loading: false }),
}));

const alice = '00000000-0000-4000-8000-000000000002';
const bob = '00000000-0000-4000-8000-000000000003';
const aliceRoom = '00000000-0000-4000-8000-000000000004';
const bobRoom = '00000000-0000-4000-8000-000000000005';
const matrixAliceRoom = `!${aliceRoom}:matrix.test`;
const matrixBobRoom = `!${bobRoom}:matrix.test`;
const createRoomMock = vi.fn();
const sendTextMessageMock = vi.fn();
let connected = true;
vi.mock('@/core/matrix/activeClient', () => ({
  useMatrixClient: () =>
    connected
      ? {
          getUserId: () => '@00000000-0000-4000-8000-000000000001:matrix.test',
          getAccountData: () => ({ getContent: () => ({ [`@${alice}:matrix.test`]: [matrixAliceRoom] }) }),
          createRoom: createRoomMock,
          sendTextMessage: sendTextMessageMock,
        }
      : null,
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
const setSelectedRoomIdMock = vi.fn();
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    setIsOpen: setIsOpenMock,
    setSelectedConversationId: setSelectedConversationIdMock,
    setSelectedRoomId: setSelectedRoomIdMock,
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
      <button type="button" onClick={() => onSelect({ id: alice, displayName: 'Alice' })}>
        add-alice
      </button>
      <button type="button" onClick={() => onSelect({ id: bob, displayName: 'Bob' })}>
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
        <div data-testid="not-reached">{(notReached ?? []).join(',')}</div>
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

import { CalloutShareOnAlkemioForm } from './CalloutShareOnAlkemioForm';

describe('CalloutShareOnAlkemioForm (US2 — Share on Alkemio → individual chats)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connected = true;
    createRoomMock.mockReset().mockResolvedValue({ room_id: matrixBobRoom });
    sendTextMessageMock.mockReset().mockResolvedValue({ event_id: '$sent' });
  });

  test('shares in the existing direct room and creates a room only for the other recipient', async () => {
    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" />);

    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('add-bob'));
    expect(screen.getByTestId('selected').textContent).toBe(`${alice},${bob}`);
    fireEvent.change(screen.getByRole('textbox', { name: 'share.alkemio.messageLabel' }), {
      target: { value: '$5 for this post' },
    });
    fireEvent.click(screen.getByText('share.alkemio.send'));

    expect(await screen.findByTestId('not-reached')).toBeEmptyDOMElement();
    expect(createRoomMock).toHaveBeenCalledTimes(1);
    expect(createRoomMock).toHaveBeenCalledWith({ invite: [`@${bob}:matrix.test`], is_direct: true });
    expect(sendTextMessageMock).toHaveBeenCalledTimes(2);
    expect(sendTextMessageMock).toHaveBeenCalledWith(matrixAliceRoom, null, '$5 for this post\n\nhttps://alkem.io/x');
    expect(sendTextMessageMock).toHaveBeenCalledWith(matrixBobRoom, null, '$5 for this post\n\nhttps://alkem.io/x');
  });

  test('a refused create lists the recipient who could not be reached and opens the successful chat', async () => {
    createRoomMock.mockRejectedValue({ errcode: 'M_FORBIDDEN' });

    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" />);

    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('add-bob'));
    fireEvent.click(screen.getByText('share.alkemio.send'));

    expect(await screen.findByTestId('not-reached')).toHaveTextContent(/^Bob$/);
    expect(sendTextMessageMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('open-chat'));

    expect(setSelectedConversationIdMock).toHaveBeenCalledWith(aliceRoom);
    expect(setSelectedRoomIdMock).toHaveBeenCalledWith(aliceRoom);
  });

  test('open chat after multiple recipients opens the conversation list and closes the share dialog', async () => {
    const onClose = vi.fn();

    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" onClose={onClose} />);

    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('add-bob'));
    fireEvent.click(screen.getByText('share.alkemio.send'));

    fireEvent.click(await screen.findByText('open-chat'));

    expect(setSelectedConversationIdMock).toHaveBeenCalledWith(null);
    expect(setSelectedRoomIdMock).toHaveBeenCalledWith(null);
    expect(setIsOpenMock).toHaveBeenCalledWith(true);
    expect(onClose).toHaveBeenCalled();
  });

  test('dismissing the confirmation closes the share dialog', async () => {
    const onClose = vi.fn();

    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" onClose={onClose} />);

    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('share.alkemio.send'));

    fireEvent.click(await screen.findByText('dismiss-confirmation'));

    expect(setSelectedConversationIdMock).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test('a failed send to an existing direct chat does not offer to open it', async () => {
    sendTextMessageMock.mockRejectedValue({ errcode: 'M_FORBIDDEN' });
    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" />);

    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('share.alkemio.send'));

    expect(await screen.findByTestId('not-reached')).toHaveTextContent(/^Alice$/);
    expect(screen.queryByText('open-chat')).not.toBeInTheDocument();
    expect(createRoomMock).not.toHaveBeenCalled();
  });

  test('a disconnected session preserves the form and shows the send failure notice', async () => {
    connected = false;
    render(<CalloutShareOnAlkemioForm url="https://alkem.io/x" entityLabel="post" />);

    fireEvent.click(screen.getByText('add-alice'));
    fireEvent.click(screen.getByText('share.alkemio.send'));

    await waitFor(() => expect(notifyMock).toHaveBeenCalledWith('share.alkemio.errors.sendFailed', 'error'));
    expect(screen.getByTestId('selected').textContent).toBe(alice);
    expect(screen.queryByTestId('confirmation')).not.toBeInTheDocument();
    expect(sendTextMessageMock).not.toHaveBeenCalled();
  });
});
