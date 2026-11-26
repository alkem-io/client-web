import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatMessage } from '@/crd/components/chat/types';
import { ConversationThread } from './ConversationThread';

type View = {
  onSendMessage: (text: string) => Promise<boolean>;
  onAttachFiles: (files: File[]) => void;
  messages: ChatMessage[];
  onReply?: (eventId: string) => void;
  replyPreview?: string;
};
const harness = vi.hoisted(() => ({ view: null as View | null }));
vi.mock('@/crd/components/chat/ChatThreadView', () => ({
  ChatThreadView: (props: View) => {
    harness.view = props;
    return null;
  },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('./attachments/useConversationStorageConfig', () => ({
  useConversationStorageConfig: () => ({
    storageConfig: {
      storageBucketId: 'bucket',
      allowedMimeTypes: ['image/png'],
      maxFileSize: 50 * 1024 * 1024,
      canUpload: true,
      temporaryLocation: false,
    },
  }),
}));

const renderedView = () => {
  if (!harness.view) throw new Error('Conversation composer not rendered');
  return harness.view;
};

const upload = vi.fn();
beforeEach(() => {
  upload.mockReset().mockResolvedValue({ ok: true, json: async () => ({ mediaId: 'media-1' }) });
  vi.stubGlobal('fetch', upload);
});
afterEach(() => vi.unstubAllGlobals());

describe('native conversation composer', () => {
  it('keeps the chosen target through a failed send and clears it on acknowledgement', async () => {
    const send = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const restore = vi.fn();
    const target: ChatMessage = {
      id: '$target',
      content: 'original',
      timestampMs: 1,
      reactions: [],
      isOwn: false,
    };
    render(
      <ConversationThread
        conversationId="conversation"
        roomId="room"
        conversation={{ id: 'room', displayName: 'Room', isGroup: false, isGuidance: false }}
        attachmentsAllowed={true}
        messages={[target, { ...target, id: '$reply', replyTo: target.id }]}
        messagesLoading={false}
        sendEvent={send}
        onClearDraft={vi.fn()}
        onRestoreDraft={restore}
      />
    );
    expect(renderedView().messages[1].replyPreview).toBe('original');
    act(() => renderedView().onReply?.(target.id));
    expect(renderedView().replyPreview).toBe('original');

    await act(async () => {
      expect(await renderedView().onSendMessage('answer')).toBe(false);
    });
    expect(restore).toHaveBeenCalledWith('answer');
    expect(renderedView().replyPreview).toBe('original');
    await act(async () => {
      expect(await renderedView().onSendMessage('answer')).toBe(true);
    });
    expect(send.mock.calls).toEqual([
      ['answer', undefined, '$target'],
      ['answer', undefined, '$target'],
    ]);
    expect(renderedView().replyPreview).toBeUndefined();
  });

  it.each([true, false])('waits for native text acknowledgement before uploading a file (%s)', async confirmed => {
    let acknowledge!: (accepted: boolean) => void;
    const pending = new Promise<boolean>(resolve => {
      acknowledge = resolve;
    });
    const send = vi.fn().mockReturnValueOnce(pending).mockResolvedValue(true);
    const clear = vi.fn();
    const restore = vi.fn();
    render(
      <ConversationThread
        conversationId="conversation"
        roomId="room"
        attachmentsAllowed={true}
        messages={[]}
        messagesLoading={false}
        sendEvent={send}
        onClearDraft={clear}
        onRestoreDraft={restore}
      />
    );
    const selected = new File(['original'], 'résumé.png', { type: 'image/png' });
    act(() => harness.view?.onAttachFiles([selected]));
    let sending!: Promise<boolean>;
    act(() => {
      sending = renderedView().onSendMessage('draft text');
    });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledExactlyOnceWith('draft text');
    expect(upload).not.toHaveBeenCalled();
    await act(async () => {
      acknowledge(confirmed);
      await sending;
    });
    if (confirmed) {
      expect(restore).not.toHaveBeenCalled();
      expect(upload).toHaveBeenCalledExactlyOnceWith(
        '/api/private/rest/messaging/media/upload?filename=r%C3%A9sum%C3%A9.png',
        expect.objectContaining({ body: selected, method: 'POST' })
      );
      expect(send).toHaveBeenLastCalledWith('', { externalReference: 'media-1', displayName: 'résumé.png' });
    } else {
      expect(restore).toHaveBeenCalledExactlyOnceWith('draft text');
      expect(upload).not.toHaveBeenCalled();
      expect(send).toHaveBeenCalledTimes(1);
    }
  });

  it('a rejected reference send preserves the uploaded reference without restoring confirmed text', async () => {
    const send = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockResolvedValue(true);
    const clear = vi.fn();
    const restore = vi.fn();
    render(
      <ConversationThread
        conversationId="conversation"
        roomId="room"
        attachmentsAllowed={true}
        messages={[]}
        messagesLoading={false}
        sendEvent={send}
        onClearDraft={clear}
        onRestoreDraft={restore}
      />
    );
    act(() => harness.view?.onAttachFiles([new File(['original'], 'photo.png', { type: 'image/png' })]));
    await act(async () => {
      expect(await renderedView().onSendMessage('confirmed text')).toBe(false);
    });
    expect(restore).not.toHaveBeenCalled();
    expect(clear).toHaveBeenCalledTimes(1);
    await act(async () => {
      expect(await renderedView().onSendMessage('')).toBe(true);
    });
    expect(upload).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenLastCalledWith('', { externalReference: 'media-1', displayName: 'photo.png' });
    expect(clear).toHaveBeenCalledTimes(1);
  });
});
