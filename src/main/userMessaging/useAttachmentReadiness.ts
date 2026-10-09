import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MessageAttachment } from '@/crd/components/comment/types';

const delays = [1000, 2000, 4000, 8000];
type Attempt = { controller: AbortController };

/** A failed media load may precede placement. Probe that resource only after the error. */
export function useAttachmentReadiness<T extends { id: string; attachments?: MessageAttachment[] }>(
  messages: T[],
  roomId: string | null | undefined
): (T & { attachments: MessageAttachment[] })[] {
  const attempts = useRef(new Map<string, Attempt>());
  const activeKeys = useRef(new Set<string>());
  const [retryKeys, setRetryKeys] = useState<Record<string, number>>({});
  const keyFor = (messageId: string, url: string | undefined) => JSON.stringify([roomId, messageId, url]);
  const keys = messages.flatMap(message => (message.attachments ?? []).map(item => keyFor(message.id, item.url)));
  const scope = JSON.stringify(keys);

  useLayoutEffect(() => {
    activeKeys.current = new Set(JSON.parse(scope) as string[]);
    for (const [key, attempt] of attempts.current) {
      if (!activeKeys.current.has(key)) {
        attempt.controller.abort();
        attempts.current.delete(key);
      }
    }
    setRetryKeys(previous => {
      const retained = Object.entries(previous).filter(([key]) => activeKeys.current.has(key));
      return retained.length === Object.keys(previous).length ? previous : Object.fromEntries(retained);
    });
  }, [scope]);

  useEffect(
    () => () => {
      for (const attempt of attempts.current.values()) attempt.controller.abort();
      attempts.current.clear();
      activeKeys.current.clear();
    },
    []
  );

  const retry = async (key: string, url: string) => {
    // A successful probe gets one presentation retry; decoding errors must not loop.
    if (!activeKeys.current.has(key) || attempts.current.has(key)) return;
    const attempt: Attempt = { controller: new AbortController() };
    attempts.current.set(key, attempt);
    const { signal } = attempt.controller;
    for (const delay of delays) {
      await new Promise<void>(resolve => {
        const finish = () => {
          clearTimeout(timer);
          signal.removeEventListener('abort', finish);
          resolve();
        };
        const timer = setTimeout(finish, delay);
        signal.addEventListener('abort', finish, { once: true });
      });
      if (signal.aborted) return;
      try {
        const response = await fetch(url, { method: 'HEAD', credentials: 'include', cache: 'no-store', signal });
        if (signal.aborted) return;
        if (response.ok) {
          setRetryKeys(previous => ({ ...previous, [key]: 1 }));
          return;
        }
        if (response.status !== 404) return;
      } catch {
        // Network failure is unavailable too; keep the same bounded budget.
        if (signal.aborted) return;
      }
    }
  };

  return messages.map(message => ({
    ...message,
    attachments: (message.attachments ?? []).map(attachment => {
      const url = attachment.url;
      const key = keyFor(message.id, url);
      return {
        ...attachment,
        retryKey: retryKeys[key] ?? 0,
        onLoadError: url
          ? () => {
              void retry(key, url);
            }
          : undefined,
      };
    }),
  }));
}
