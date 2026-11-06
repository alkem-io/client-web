import { render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

const useCrdRoomCommentsArgs = vi.fn();
vi.mock('@/main/crdPages/space/hooks/useCrdRoomComments', () => ({
  useCrdRoomComments: (args: unknown) => {
    useCrdRoomCommentsArgs(args);
    return { thread: null, commentInput: null, commentCount: 0 };
  },
}));
const onOpenChatSpy = vi.fn();
vi.mock('@/main/crdPages/topLevelPages/common/useSendMessageHandler', () => ({
  useOpenDirectChatHandler: () => ({ onOpenChat: onOpenChatSpy }),
}));

import { DiscussionCommentsConnector } from './DiscussionCommentsConnector';

test('a comment author hover card Message action opens a chat with that author', () => {
  render(<DiscussionCommentsConnector roomId="room-1" room={undefined} />);
  const { onMessageContributor } = useCrdRoomCommentsArgs.mock.lastCall?.[0] as {
    onMessageContributor: (contributor: { id: string }) => void;
  };
  onMessageContributor({ id: 'u2' });
  expect(onOpenChatSpy).toHaveBeenCalledWith('u2');
});
