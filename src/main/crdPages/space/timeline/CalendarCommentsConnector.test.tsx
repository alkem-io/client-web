import { render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

const { messageContributor, roomComments } = vi.hoisted(() => ({
  messageContributor: vi.fn(),
  roomComments: vi.fn((_params: Record<string, unknown>) => ({ thread: null, commentInput: null, commentCount: 0 })),
}));

vi.mock('../hooks/useCrdRoomComments', () => ({ useCrdRoomComments: roomComments }));
vi.mock('@/main/crdPages/topLevelPages/common/useSendMessageHandler', () => ({
  useMessageContributor: () => messageContributor,
}));

const { CalendarCommentsConnector } = await import('./CalendarCommentsConnector');

test('the event dialog comments get the direct-chat Message action on their author cards', () => {
  render(
    <CalendarCommentsConnector roomId="room" room={undefined}>
      {() => null}
    </CalendarCommentsConnector>
  );
  expect(roomComments).toHaveBeenCalledWith(expect.objectContaining({ onMessageContributor: messageContributor }));
});
