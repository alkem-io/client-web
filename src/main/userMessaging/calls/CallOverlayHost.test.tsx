import { EventEmitter } from 'node:events';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  client: null as unknown,
  isJoinedHere: false,
  apis: [] as Array<{
    widget: { definition: { id: string; url: string; creatorUserId: string } };
    iframe: HTMLIFrameElement;
    emit: (event: string, ...args: unknown[]) => boolean;
    transport: { reply: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn> };
    setViewedRoomId: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  }>,
}));

vi.mock('matrix-widget-api', async () => {
  const { EventEmitter: Emitter } = await import('node:events');
  const { vi: vitest } = await import('vitest');
  class ClientWidgetApi extends Emitter {
    transport = { reply: vitest.fn(), send: vitest.fn(async () => ({})) };
    setViewedRoomId = vitest.fn();
    stop = vitest.fn();
    feedEvent = vitest.fn(async () => {});
    feedStateUpdate = vitest.fn(async () => {});
    constructor(
      readonly widget: unknown,
      readonly iframe: HTMLIFrameElement
    ) {
      super();
      harness.apis.push(this as never);
    }
  }
  class Widget {
    constructor(readonly definition: unknown) {}
  }
  class WidgetDriver {}
  return { ClientWidgetApi, Widget, WidgetDriver, OpenIDRequestState: { Allowed: 'allowed', Blocked: 'blocked' } };
});
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('@/core/matrix/activeClient', () => ({ useMatrixClient: () => harness.client }));
vi.mock('./useRoomCallSession', () => ({
  useRoomCallSession: () => ({ participants: [], participantCount: 0, isJoinedHere: harness.isJoinedHere }),
}));
vi.mock('./callConfig', () => ({ getCallConfig: () => ({ livekitServiceUrl: 'https://hs.example/livekit/jwt' }) }));

import { CallOverlayHost } from './CallOverlayHost';
import { closeCall, getCallOverlay, openCall } from './callOverlayStore';

const makeClient = () =>
  Object.assign(new EventEmitter(), {
    baseUrl: 'https://hs.example',
    getUserId: () => '@me:hs.example',
    getDeviceId: () => 'DEV1',
  });

const widgetAction = (action: string) =>
  new CustomEvent(`action:${action}`, { cancelable: true, detail: { action, requestId: 'r1', data: {} } });

const startCall = async () => {
  act(() => openCall({ alkemioRoomId: 'alk-1', matrixRoomId: '!room:hs.example', intent: 'start_call' }));
  await waitFor(() => expect(harness.apis).toHaveLength(1));
  return harness.apis[0];
};

describe('CallOverlayHost', () => {
  beforeEach(() => {
    harness.client = makeClient();
    harness.isJoinedHere = false;
    harness.apis.length = 0;
  });
  afterEach(() => {
    act(() => closeCall());
  });

  it('renders nothing without a call', () => {
    render(<CallOverlayHost />);
    expect(screen.queryByTestId('call-overlay')).not.toBeInTheDocument();
  });

  it('opens the call UI entry page with the call’s parameters and links it to the session', async () => {
    render(<CallOverlayHost />);
    const api = await startCall();
    const iframe = screen.getByTitle('call.overlayLabel') as HTMLIFrameElement;

    expect(iframe.getAttribute('src')?.startsWith('/element-call/index.html#?')).toBe(true);
    expect(iframe.getAttribute('src')).toContain('roomId=%21room%3Ahs.example');
    expect(iframe.getAttribute('src')).toContain('intent=start_call');
    expect(iframe.getAttribute('allow')).toBe('camera; microphone; display-capture; autoplay; clipboard-write');
    expect(api.iframe).toBe(iframe);
    expect(api.widget.definition.id).toBe(getCallOverlay()?.widgetId);
    expect(api.widget.definition.url.startsWith(`${window.location.origin}/element-call/index.html#?`)).toBe(true);
    expect(api.setViewedRoomId).toHaveBeenCalledWith('!room:hs.example');
  });

  it.each(['im.vector.hangup', 'io.element.close'])('closes when the call UI sends %s', async action => {
    render(<CallOverlayHost />);
    const api = await startCall();
    const event = widgetAction(action);
    act(() => {
      api.emit(`action:${action}`, event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(api.transport.reply).toHaveBeenCalledWith(event.detail, {});
    expect(getCallOverlay()).toBeNull();
    expect(screen.queryByTestId('call-overlay')).not.toBeInTheDocument();
    expect(api.stop).toHaveBeenCalled();
  });

  it('closes immediately when closed before joining', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<CallOverlayHost />);
    await startCall();
    await user.click(screen.getByRole('button', { name: 'call.close' }));
    expect(getCallOverlay()).toBeNull();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('asks before leaving a joined call, then hangs up and closes', async () => {
    harness.isJoinedHere = true;
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<CallOverlayHost />);
    const api = await startCall();

    await user.click(screen.getByRole('button', { name: 'call.close' }));
    expect(screen.getByRole('alertdialog', { name: 'call.leaveConfirm.title' })).toBeInTheDocument();
    expect(getCallOverlay()).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'call.leaveConfirm.confirm' }));
    await waitFor(() => expect(getCallOverlay()).toBeNull());
    expect(api.transport.send).toHaveBeenCalledWith('im.vector.hangup', {});
  });

  it('keeps the call when the leave confirmation is cancelled', async () => {
    harness.isJoinedHere = true;
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<CallOverlayHost />);
    const api = await startCall();

    await user.click(screen.getByRole('button', { name: 'call.close' }));
    await user.click(screen.getByRole('button', { name: 'call.leaveConfirm.cancel' }));
    expect(getCallOverlay()).not.toBeNull();
    expect(api.transport.send).not.toHaveBeenCalled();
    expect(api.stop).not.toHaveBeenCalled();
  });

  it('closes when the chat session goes away', async () => {
    const { rerender } = render(<CallOverlayHost />);
    const api = await startCall();
    harness.client = null;
    rerender(<CallOverlayHost />);
    expect(getCallOverlay()).toBeNull();
    expect(api.stop).toHaveBeenCalled();
  });

  it('closes when the chat session is replaced by another one', async () => {
    const { rerender } = render(<CallOverlayHost />);
    await startCall();
    harness.client = makeClient();
    rerender(<CallOverlayHost />);
    expect(getCallOverlay()).toBeNull();
  });
});
