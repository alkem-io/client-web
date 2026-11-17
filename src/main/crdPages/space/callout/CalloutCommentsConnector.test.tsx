import { render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';

const useCrdRoomCommentsArgs = vi.fn();
vi.mock('../hooks/useCrdRoomComments', () => ({
  useCrdRoomComments: (args: unknown) => {
    useCrdRoomCommentsArgs(args);
    return { thread: null, commentInput: null, commentCount: 0 };
  },
}));
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: false }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutContributionCommentsQuery: () => ({ data: undefined }),
}));

import { CalloutCommentsConnector } from './CalloutCommentsConnector';

test('forwards onMessageContributor to the shared room-comments hook', () => {
  const onMessageContributor = vi.fn();
  const roomData = { id: 'room-1', messages: [] } as unknown as CommentsWithMessagesModel;
  render(<CalloutCommentsConnector roomId="room-1" roomData={roomData} onMessageContributor={onMessageContributor} />);
  expect(useCrdRoomCommentsArgs).toHaveBeenCalledWith(expect.objectContaining({ onMessageContributor }));
});
