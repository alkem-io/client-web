import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildElementCallWidgetUrl,
  type CallAction,
  type CallMedia,
  callIntentFor,
  isDirectCallIntent,
  type WidgetUrlInput,
} from './widgetUrl';

const input: WidgetUrlInput = {
  widgetId: 'w-1',
  parentOrigin: 'https://dev.example.org',
  matrixRoomId: '!abc:matrix.example.org',
  userId: '@ann:matrix.example.org',
  deviceId: 'DEVICE1',
  baseUrl: 'https://matrix.example.org',
  intent: 'start_call_voice',
  lang: 'nl',
};

const paramsOf = (url: string) => new URLSearchParams(url.slice(url.indexOf('#?') + 2));

describe('buildElementCallWidgetUrl', () => {
  it('points at the entry page itself, never the bare directory', () => {
    const url = buildElementCallWidgetUrl(input);
    expect(url.startsWith('/element-call/index.html#?')).toBe(true);
  });

  it('carries the parameters in the fragment, not the query', () => {
    const url = new URL(buildElementCallWidgetUrl(input), 'https://dev.example.org');
    expect(url.search).toBe('');
    expect(url.hash.startsWith('#?')).toBe(true);
  });

  it('carries every parameter the call UI requires in widget mode, plus the fixed ones', () => {
    const params = paramsOf(buildElementCallWidgetUrl(input));
    expect(Object.fromEntries(params)).toEqual({
      widgetId: 'w-1',
      parentUrl: 'https://dev.example.org',
      roomId: '!abc:matrix.example.org',
      userId: '@ann:matrix.example.org',
      deviceId: 'DEVICE1',
      baseUrl: 'https://matrix.example.org',
      intent: 'start_call_voice',
      header: 'none',
      enableE2EE: 'false',
      perParticipantE2EE: 'false',
      lang: 'nl',
    });
  });

  it('always switches end-to-end encryption off, whatever the intent', () => {
    for (const intent of ['start_call', 'start_call_voice', 'join_existing', 'join_existing_voice'] as const) {
      const params = paramsOf(buildElementCallWidgetUrl({ ...input, intent }));
      expect(params.get('intent')).toBe(intent);
      expect(params.get('enableE2EE')).toBe('false');
      expect(params.get('perParticipantE2EE')).toBe('false');
    }
  });

  it('passes the platform origin as parentUrl and encodes room ids', () => {
    const url = buildElementCallWidgetUrl(input);
    expect(url).toContain('parentUrl=https%3A%2F%2Fdev.example.org');
    expect(url).toContain('roomId=%21abc%3Amatrix.example.org');
    expect(paramsOf(url).get('roomId')).toBe('!abc:matrix.example.org');
  });

  it('does not set a theme', () => {
    expect(paramsOf(buildElementCallWidgetUrl(input)).has('theme')).toBe(false);
  });
});

describe('callIntentFor', () => {
  it.each([
    [true, 'start', 'video', 'start_call'],
    [true, 'start', 'voice', 'start_call_voice'],
    [true, 'join', 'video', 'join_existing'],
    [true, 'join', 'voice', 'join_existing_voice'],
    [false, 'start', 'video', 'start_call_dm'],
    [false, 'start', 'voice', 'start_call_dm_voice'],
    [false, 'join', 'video', 'join_existing_dm'],
    [false, 'join', 'voice', 'join_existing_dm_voice'],
  ] as const)('isGroup %s, %s with %s opens %s', (isGroup, action, media, intent) => {
    expect(callIntentFor({ isGroup, action, media })).toBe(intent);
    expect(isDirectCallIntent(intent)).toBe(!isGroup);
  });

  it('uses only intents the pinned call UI configures itself for', () => {
    const assetsDir = path.join(process.cwd(), 'node_modules/@element-hq/element-call-embedded/dist/assets');
    const bundle = readdirSync(assetsDir)
      .filter(file => /^index-.*\.js$/.test(file))
      .map(file => readFileSync(path.join(assetsDir, file), 'utf8'))
      .join('\n');
    for (const isGroup of [true, false]) {
      for (const action of ['start', 'join'] as CallAction[]) {
        for (const media of ['video', 'voice'] as CallMedia[]) {
          const intent = callIntentFor({ isGroup, action, media });
          expect(bundle).toContain(`case\`${intent}\`:`);
        }
      }
    }
  });
});
