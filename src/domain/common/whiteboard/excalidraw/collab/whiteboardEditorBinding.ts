import type { ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/types';
import type { Awareness } from 'y-protocols/awareness';
import { AwarenessRouter, type EphemeralChannel } from './awarenessRouter';

const CURSOR_COLORS = [
  '#958DF1',
  '#F98181',
  '#FBBC88',
  '#70CFF8',
  '#94FADB',
  '#B9F18D',
  '#EEC759',
  '#9BB8CD',
  '#FF90BC',
  '#DC8686',
  '#7ED7C1',
];

const cursorColorFor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
};

/** Pure presence/editor binding; it owns no socket, admission, save, or close policy. */
export const bindWhiteboardEditor = (
  api: ExcalidrawImperativeAPI,
  awareness: Awareness,
  ephemeral: EphemeralChannel
) => {
  const router = new AwarenessRouter({ awareness, api, ephemeral });
  return {
    setUser: (username: string) => awareness.setLocalStateField('user', { username, color: cursorColorFor(username) }),
    onPointerUpdate: router.onPointerUpdate.bind(router),
    broadcastEmojiReaction: (emoji: string, x: number, y: number) =>
      router.broadcastEmojiReaction({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, emoji, x, y }),
    broadcastCountdownTimer: (remainingSeconds: number, startedBy: string, active: boolean) =>
      router.broadcastCountdownTimer({ remainingSeconds, startedBy, active }),
    fitScene: () => {
      const elements = api.getSceneElements();
      if (elements.length > 0) {
        api.scrollToContent(elements, { animate: false, fitToViewport: true, viewportZoomFactor: 0.75, maxZoom: 1 });
      }
    },
    destroy: () => router.destroy(),
  };
};
