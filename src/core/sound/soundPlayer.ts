/**
 * Autoplay-safe, self-debouncing player for the two notification cues.
 *
 * - One lazily-constructed, preloaded `HTMLAudioElement` per key, reused across
 *   plays (`currentTime = 0; play()`).
 * - `play()` rejections are swallowed so the browser autoplay policy's
 *   `NotAllowedError` never surfaces or blocks the page (FR-011).
 * - A module-level, per-key rolling 5-second debounce (FR-012). The debounce
 *   lives here — never at the call sites — so the unread badge and cache still
 *   process every event even when its sound is coalesced away.
 *
 * Assets live in `public/sounds/` and are referenced by absolute URL so they can
 * be swapped without a rebuild.
 */

export type SoundKey = 'chat' | 'notification';

const SOUND_SOURCES: Record<SoundKey, string> = {
  chat: '/sounds/chat.mp3',
  notification: '/sounds/notification.mp3',
};

const DEBOUNCE_MS = 5000;

const audioElements: Partial<Record<SoundKey, HTMLAudioElement>> = {};
const lastPlayedAt: Partial<Record<SoundKey, number>> = {};

const getAudio = (key: SoundKey): HTMLAudioElement => {
  let audio = audioElements[key];
  if (!audio) {
    audio = new Audio(SOUND_SOURCES[key]);
    audio.preload = 'auto';
    audioElements[key] = audio;
  }
  return audio;
};

export const playSound = (key: SoundKey): void => {
  const now = Date.now();
  const last = lastPlayedAt[key];
  if (last !== undefined && now - last < DEBOUNCE_MS) {
    return;
  }
  lastPlayedAt[key] = now;

  const audio = getAudio(key);
  audio.currentTime = 0;
  // Swallow the rejection — the autoplay policy rejects with NotAllowedError
  // until the page has had a user gesture, and that must never surface (FR-011).
  void audio.play().catch(() => {});
};
