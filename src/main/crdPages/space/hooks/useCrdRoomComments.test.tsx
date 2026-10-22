import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';

const mockSendMessage = vi.fn();
const mockReply = vi.fn();
const mockFetch = vi.fn();
const mockBucketQuery = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { name?: string }) => (opts?.name ? `${key}:${opts.name}` : key),
  }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useRemoveMessageOnRoomMutation: () => [vi.fn(), { loading: false }],
  useSendMessageToRoomMutation: () => [mockSendMessage, { loading: false }],
  useReplyToMessageMutation: () => [mockReply, { loading: false }],
  useCommentRoomStorageBucketQuery: (options: unknown) => mockBucketQuery(options),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/collaboration/callout/useSubscribeOnRoomEvents', () => ({ default: () => true }));
vi.mock('@/domain/communication/room/Comments/useCommentReactionsMutations', () => ({
  default: () => ({ addReaction: vi.fn(), removeReaction: vi.fn() }),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    userModel: { id: 'u1', profile: { displayName: 'Me' } },
    isAuthenticated: true,
  }),
}));
vi.mock('./useMentionableContributors', () => ({ useMentionableContributors: () => undefined }));
vi.mock('@/main/userMessaging/useAttachmentReadiness', () => ({
  useAttachmentReadiness: <T,>(messages: T[]) => messages,
}));
vi.mock('@/crd/primitives/avatar');

const { useCrdRoomComments } = await import('./useCrdRoomComments');

// The space's shared bucket as an ordinary member reads it: types and size only.
// Upload rights on it are not fetched; the room's privileges decide.
const readableBucket = {
  data: {
    lookup: { storageBucket: { id: 'bucket-1', allowedMimeTypes: ['image/png'], maxFileSize: 5 * 1024 * 1024 } },
  },
};
const noBucket = { data: undefined };

type Room = Pick<CommentsWithMessagesModel, 'messages' | 'authorization' | 'attachmentBucketId'>;
const room = (overrides: Partial<Room> = {}): Room => ({
  attachmentBucketId: 'bucket-1',
  authorization: {
    myPrivileges: [
      AuthorizationPrivilege.Read,
      AuthorizationPrivilege.CreateMessage,
      AuthorizationPrivilege.CreateMessageReply,
    ],
  },
  messages: [],
  ...overrides,
});
const withComment = room({
  messages: [
    {
      id: 'c1',
      message: 'first comment',
      timestamp: Date.now(),
      reactions: [],
      sender: { id: 'u2', profile: { id: 'p2', displayName: 'Other', url: '/u/other' } },
    },
  ],
});

function Harness({ value }: { value: Room }) {
  const { thread, commentInput } = useCrdRoomComments({ roomId: 'room-1', room: value });
  return (
    <>
      {thread}
      <div data-testid="top-level">{commentInput}</div>
    </>
  );
}

const png = (name: string) => new File(['bytes'], name, { type: 'image/png' });
const uploadOk = (mediaId: string) => ({ ok: true, json: async () => ({ mediaId }) });
const topLevel = () => within(screen.getByTestId('top-level'));
const fileInputIn = (element: HTMLElement) => element.querySelector('input[type="file"]') as HTMLInputElement;
const typeInto = (textarea: HTMLElement, text: string) => fireEvent.change(textarea, { target: { value: text } });
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
};
const sent = { data: { sendMessageToRoom: { id: 'm1' } } };

describe('useCrdRoomComments composers', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    mockSendMessage.mockReset();
    mockReply.mockReset();
    mockFetch.mockReset();
    mockBucketQuery.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => vi.unstubAllGlobals());

  test('no image button when the bucket policy is unavailable, and a text comment still posts with message only', async () => {
    mockBucketQuery.mockReturnValue(noBucket);
    mockSendMessage.mockResolvedValue(sent);
    render(<Harness value={room()} />);
    expect(screen.queryByRole('button', { name: 'comments.attachments.addImage' })).not.toBeInTheDocument();
    typeInto(topLevel().getByRole('textbox'), 'hello');
    await act(async () => {
      fireEvent.click(topLevel().getByRole('button', { name: 'comments.send' }));
    });
    expect(mockSendMessage).toHaveBeenCalledExactlyOnceWith({
      variables: { messageData: { roomID: 'room-1', message: 'hello', attachmentUpload: undefined } },
    });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(topLevel().getByRole('textbox')).toHaveValue('');
  });

  test('a member with only READ on the bucket and CREATE_MESSAGE on the room: staging one image and text calls sendMessageToRoom twice: image then text, and clears the field only after the text', async () => {
    mockBucketQuery.mockReturnValue(readableBucket);
    mockFetch.mockResolvedValue(uploadOk('media-1'));
    const textSend = deferred<typeof sent>();
    mockSendMessage.mockResolvedValueOnce(sent).mockReturnValueOnce(textSend.promise);
    render(<Harness value={room()} />);
    const box = topLevel().getByRole('textbox');
    typeInto(box, 'see this');
    fireEvent.change(fileInputIn(screen.getByTestId('top-level')), { target: { files: [png('shot.png')] } });
    expect(topLevel().getByText('shot.png')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(topLevel().getByRole('button', { name: 'comments.send' }));
    });
    expect(mockSendMessage.mock.calls.map(([options]) => options.variables.messageData)).toEqual([
      { roomID: 'room-1', message: '', attachmentUpload: { externalReference: 'media-1', displayName: 'shot.png' } },
      { roomID: 'room-1', message: 'see this', attachmentUpload: undefined },
    ]);
    expect(box).toHaveValue('see this');
    await act(async () => {
      textSend.resolve(sent);
      await textSend.promise;
    });
    expect(box).toHaveValue('');
    expect(topLevel().queryByText('shot.png')).not.toBeInTheDocument();
  });

  test('a second staged image is refused and the first stays', () => {
    mockBucketQuery.mockReturnValue(readableBucket);
    render(<Harness value={room()} />);
    const input = fileInputIn(screen.getByTestId('top-level'));
    fireEvent.change(input, { target: { files: [png('a.png')] } });
    fireEvent.change(input, { target: { files: [png('b.png')] } });
    expect(topLevel().getByText('a.png')).toBeInTheDocument();
    expect(topLevel().queryByText('b.png')).not.toBeInTheDocument();
    expect(topLevel().getAllByRole('button', { name: /comments\.attachments\.removeAttachment/ })).toHaveLength(1);
    expect(topLevel().getByText('comments.attachments.errorTooMany')).toBeInTheDocument();
  });

  test('a failed upload keeps the typed text in the field and marks the chip', async () => {
    mockBucketQuery.mockReturnValue(readableBucket);
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    render(<Harness value={room()} />);
    const box = topLevel().getByRole('textbox');
    typeInto(box, 'see this');
    fireEvent.change(fileInputIn(screen.getByTestId('top-level')), { target: { files: [png('shot.png')] } });
    await act(async () => {
      fireEvent.click(topLevel().getByRole('button', { name: 'comments.send' }));
    });
    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(box).toHaveValue('see this');
    expect(topLevel().getByText('shot.png').closest('li')).toHaveClass('text-destructive');
    expect(topLevel().getByText('comments.attachments.uploadFailed')).toBeInTheDocument();
  });

  test('the field and the image button are disabled while a send is in flight', async () => {
    mockBucketQuery.mockReturnValue(readableBucket);
    const upload = deferred<ReturnType<typeof uploadOk>>();
    mockFetch.mockReturnValue(upload.promise);
    mockSendMessage.mockResolvedValue(sent);
    render(<Harness value={room()} />);
    fireEvent.change(fileInputIn(screen.getByTestId('top-level')), { target: { files: [png('shot.png')] } });
    await act(async () => {
      fireEvent.click(topLevel().getByRole('button', { name: 'comments.send' }));
    });
    expect(topLevel().getByRole('textbox')).toBeDisabled();
    expect(topLevel().getByRole('button', { name: 'comments.attachments.addImage' })).toBeDisabled();
    await act(async () => {
      upload.resolve(uploadOk('media-1'));
      await upload.promise;
    });
    expect(topLevel().getByRole('textbox')).not.toBeDisabled();
  });

  test('opening a reply keys a separate draft: files staged in the reply are not in the top-level list, and the reply posts with its threadId', async () => {
    mockBucketQuery.mockReturnValue(readableBucket);
    mockFetch.mockResolvedValue(uploadOk('media-r'));
    mockReply.mockResolvedValue({ data: { sendMessageReplyToRoom: { id: 'r1' } } });
    render(<Harness value={withComment} />);
    fireEvent.click(screen.getByRole('button', { name: 'comments.reply' }));
    const replyBox = document.getElementById('comment-reply-input-c1') as HTMLElement;
    expect(within(replyBox).getByRole('button', { name: 'comments.attachments.addImage' })).toBeInTheDocument();
    fireEvent.change(fileInputIn(replyBox), { target: { files: [png('reply.png')] } });
    expect(within(replyBox).getByText('reply.png')).toBeInTheDocument();
    expect(topLevel().queryByText('reply.png')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(within(replyBox).getByRole('button', { name: 'comments.send' }));
    });
    expect(mockReply).toHaveBeenCalledExactlyOnceWith({
      variables: {
        roomId: 'room-1',
        message: '',
        threadId: 'c1',
        attachmentUpload: { externalReference: 'media-r', displayName: 'reply.png' },
      },
    });
    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(document.getElementById('comment-reply-input-c1')).toBeNull();
  });

  test('a reply whose text is not confirmed stays open with the typed text, and a confirmed retry clears it', async () => {
    mockBucketQuery.mockReturnValue(readableBucket);
    mockReply
      .mockResolvedValueOnce({ data: undefined })
      .mockResolvedValueOnce({ data: { sendMessageReplyToRoom: { id: 'r1' } } });
    render(<Harness value={withComment} />);
    fireEvent.click(screen.getByRole('button', { name: 'comments.reply' }));
    const replyBox = () => document.getElementById('comment-reply-input-c1') as HTMLElement;
    typeInto(within(replyBox()).getByRole('textbox'), 'my reply');
    await act(async () => {
      fireEvent.click(within(replyBox()).getByRole('button', { name: 'comments.send' }));
    });
    expect(within(replyBox()).getByRole('textbox')).toHaveValue('my reply');
    expect(within(replyBox()).getByText('comments.attachments.sendUnconfirmed')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(within(replyBox()).getByRole('button', { name: 'comments.send' }));
    });
    expect(mockReply).toHaveBeenCalledTimes(2);
    expect(mockReply).toHaveBeenLastCalledWith({
      variables: { roomId: 'room-1', message: 'my reply', threadId: 'c1', attachmentUpload: undefined },
    });
    expect(replyBox()).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'comments.reply' }));
    expect(within(replyBox()).getByRole('textbox')).toHaveValue('');
  });

  test('a reply whose text is sent but whose image upload fails stays open with the text cleared', async () => {
    mockBucketQuery.mockReturnValue(readableBucket);
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    mockReply.mockResolvedValue({ data: { sendMessageReplyToRoom: { id: 'r1' } } });
    render(<Harness value={withComment} />);
    fireEvent.click(screen.getByRole('button', { name: 'comments.reply' }));
    const replyBox = () => document.getElementById('comment-reply-input-c1') as HTMLElement;
    typeInto(within(replyBox()).getByRole('textbox'), 'my reply');
    fireEvent.change(fileInputIn(replyBox()), { target: { files: [png('reply.png')] } });
    await act(async () => {
      fireEvent.click(within(replyBox()).getByRole('button', { name: 'comments.send' }));
    });
    expect(mockReply).toHaveBeenCalledOnce();
    expect(within(replyBox()).getByRole('textbox')).toHaveValue('');
    expect(within(replyBox()).getByText('comments.attachments.uploadFailed')).toBeInTheDocument();
  });

  test('the bucket policy is not queried when the viewer cannot comment', () => {
    mockBucketQuery.mockReturnValue(noBucket);
    render(<Harness value={room({ authorization: { myPrivileges: [AuthorizationPrivilege.Read] } })} />);
    expect(mockBucketQuery).toHaveBeenCalledWith({ variables: { bucketId: 'bucket-1' }, skip: true });
    expect(mockBucketQuery).not.toHaveBeenCalledWith({ variables: { bucketId: 'bucket-1' }, skip: false });
  });

  test('a member who may comment but not reply gets the image button on the comment field only', () => {
    mockBucketQuery.mockReturnValue(readableBucket);
    render(
      <Harness
        value={{
          ...withComment,
          authorization: { myPrivileges: [AuthorizationPrivilege.Read, AuthorizationPrivilege.CreateMessage] },
        }}
      />
    );
    expect(topLevel().getByRole('button', { name: 'comments.attachments.addImage' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'comments.reply' }));
    const replyBox = document.getElementById('comment-reply-input-c1') as HTMLElement;
    expect(within(replyBox).queryByRole('button', { name: 'comments.attachments.addImage' })).not.toBeInTheDocument();
  });
});
