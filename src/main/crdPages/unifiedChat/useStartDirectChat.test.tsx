import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const viewer = '00000000-0000-4000-8000-000000000001';
const first = '00000000-0000-4000-8000-000000000002';
const second = '00000000-0000-4000-8000-000000000003';
const room = '00000000-0000-4000-8000-000000000004';
const server = 'matrix.test';
const mockCreateRoom = vi.fn();
const mockGetAccountData = vi.fn();
const mockErrorToast = vi.fn();
const mockDirectory = vi.fn();

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('sonner', () => ({ toast: { error: (...args: unknown[]) => mockErrorToast(...args) } }));

vi.mock('@/core/matrix/activeClient', () => ({
  useMatrixClient: () => ({
    getUserId: () => `@${viewer}:${server}`,
    createRoom: mockCreateRoom,
    getAccountData: mockGetAccountData,
  }),
}));
vi.mock('@/core/apollo/hooks/useReportedQueryError', () => ({ useReportedQueryError: () => {} }));
vi.mock('./useChatRecipientDirectory', () => ({
  useChatRecipientDirectory: (terms: string, actorId: string | undefined) => mockDirectory(terms, actorId),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: viewer } }),
}));

const mockSetIsOpen = vi.fn();
const mockSetSelectedConversationId = vi.fn();
const mockSetSelectedRoomId = vi.fn();
const mockSetNewlyCreatedConversationId = vi.fn();
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    setIsOpen: mockSetIsOpen,
    setSelectedConversationId: mockSetSelectedConversationId,
    setSelectedRoomId: mockSetSelectedRoomId,
    setNewlyCreatedConversationId: mockSetNewlyCreatedConversationId,
  }),
}));

import { useNewChat } from './useNewChat';
import { useStartDirectChat } from './useStartDirectChat';

beforeEach(() => {
  mockCreateRoom.mockReset().mockResolvedValue({ room_id: `!${room}:${server}` });
  mockGetAccountData.mockReset();
  mockSetIsOpen.mockReset();
  mockSetSelectedConversationId.mockReset();
  mockSetSelectedRoomId.mockReset();
  mockSetNewlyCreatedConversationId.mockReset();
  mockErrorToast.mockReset();
  mockDirectory.mockReset().mockReturnValue({ searchResults: [], loading: false });
});

describe('native conversation creation', () => {
  test('the click-time recipient takes precedence and opens the returned room', async () => {
    const { result } = renderHook(() => useStartDirectChat(first));

    const outcome = await result.current.startDirectChat(second);

    expect(mockCreateRoom).toHaveBeenCalledWith({ invite: [`@${second}:${server}`], is_direct: true });
    expect(outcome).toEqual({ conversationId: room, roomId: room });
    expect(mockSetSelectedConversationId).toHaveBeenCalledWith(room);
    expect(mockSetSelectedRoomId).toHaveBeenCalledWith(room);
    expect(mockSetIsOpen).toHaveBeenCalledWith(true);
  });

  test('the profile flow uses the recipient supplied to the hook', async () => {
    const { result } = renderHook(() => useStartDirectChat(first));

    await result.current.startDirectChat();

    expect(mockCreateRoom).toHaveBeenCalledWith({ invite: [`@${first}:${server}`], is_direct: true });
  });

  test('a direct pair in m.direct opens without a create request', async () => {
    mockGetAccountData.mockReturnValue({
      getContent: () => ({ [`@${first}:${server}`]: [`!${room}:remote.test`, `!${room}:${server}`] }),
    });
    const { result } = renderHook(() => useStartDirectChat(first));

    await expect(result.current.startDirectChat()).resolves.toEqual({ conversationId: room, roomId: room });
    expect(mockGetAccountData).toHaveBeenCalledWith('m.direct');
    expect(mockCreateRoom).not.toHaveBeenCalled();
  });

  test('a competing create can reopen a direct pair delivered while the request was in flight', async () => {
    mockCreateRoom.mockRejectedValue({ errcode: 'M_FORBIDDEN' });
    mockGetAccountData.mockReturnValueOnce(undefined).mockReturnValue({
      getContent: () => ({ [`@${first}:${server}`]: [`!${room}:${server}`] }),
    });
    const { result } = renderHook(() => useStartDirectChat(first));

    await expect(result.current.startDirectChat()).resolves.toEqual({ conversationId: room, roomId: room });
    expect(mockSetSelectedRoomId).toHaveBeenCalledWith(room);
  });

  test('no recipient refuses before any Matrix request', async () => {
    const { result } = renderHook(() => useStartDirectChat(undefined));

    await expect(result.current.startDirectChat()).rejects.toThrow('Recipient user not loaded.');
    expect(mockCreateRoom).not.toHaveBeenCalled();
  });

  test('a directory result supplies the Matrix invitee for new chat', async () => {
    const recipient = { id: first, displayName: 'Ada' };
    mockDirectory.mockImplementation((terms: string) => ({
      searchResults: terms === 'Ada' ? [recipient] : [],
      loading: false,
    }));
    const onCreated = vi.fn();
    const { result } = renderHook(() => useNewChat(onCreated));

    act(() => result.current.openDialog());
    act(() => result.current.onSearchChange(' Ada '));
    await waitFor(() => expect(result.current.searchResults).toEqual([recipient]));
    expect(mockDirectory).toHaveBeenLastCalledWith('Ada', viewer);

    act(() => result.current.onSelect(result.current.searchResults[0]));
    await act(async () => {
      await result.current.create();
    });
    expect(mockCreateRoom).toHaveBeenCalledWith({ invite: [`@${first}:${server}`], is_direct: true });
    expect(onCreated).toHaveBeenCalledWith(room, room);
  });

  test('the new-chat dialog creates a named group with canonical Matrix invitees', async () => {
    const onCreated = vi.fn();
    const { result } = renderHook(() => useNewChat(onCreated));

    act(() => {
      result.current.openDialog();
      result.current.onSelect({ id: first, displayName: 'Ada' });
      result.current.onSelect({ id: second, displayName: 'Lin' });
    });
    await act(async () => {
      await result.current.create();
    });

    expect(mockCreateRoom).toHaveBeenCalledWith({
      invite: [`@${first}:${server}`, `@${second}:${server}`],
      is_direct: false,
      name: 'Ada, Lin',
    });
    expect(onCreated).toHaveBeenCalledWith(room, room);
    expect(result.current.open).toBe(false);
    expect(result.current.selectedUsers).toEqual([]);
  });

  test('a refused create keeps the dialog and its selection open with an error toast', async () => {
    mockCreateRoom.mockRejectedValue({ errcode: 'M_FORBIDDEN' });
    const onCreated = vi.fn();
    const { result } = renderHook(() => useNewChat(onCreated));
    const recipient = { id: first, displayName: 'Ada' };

    act(() => {
      result.current.openDialog();
      result.current.onSelect(recipient);
    });
    await act(async () => {
      await result.current.create();
    });

    expect(onCreated).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
    expect(result.current.selectedUsers).toEqual([recipient]);
    expect(mockErrorToast).toHaveBeenCalledWith('common.messagePopover.openChatError');
  });
});
