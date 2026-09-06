import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveWhiteboardGuestIdentity } from '../utils/resolveWhiteboardGuestIdentity';

const { mockGetGuestName } = vi.hoisted(() => ({ mockGetGuestName: { value: null as string | null } }));
vi.mock('../utils/sessionStorage', () => ({ getGuestName: () => mockGetGuestName.value }));

const setPath = (path: string) => window.history.pushState({}, '', path);

describe('resolveWhiteboardGuestIdentity', () => {
  afterEach(() => {
    mockGetGuestName.value = null;
    setPath('/');
  });

  it('off the public whiteboard route → not public, no guest name (the auth cookie identifies the user)', () => {
    setPath('/spaces/foo');
    mockGetGuestName.value = 'Alice B';
    expect(resolveWhiteboardGuestIdentity()).toEqual({ isPublicRoute: false, guestName: undefined });
  });

  it('on the public route with a valid guest name → returns it', () => {
    setPath('/public/whiteboard/wb-1');
    mockGetGuestName.value = 'Alice B';
    expect(resolveWhiteboardGuestIdentity()).toEqual({ isPublicRoute: true, guestName: 'Alice B' });
  });

  it('on the public route with an INVALID name → fails closed (public, no guest name)', () => {
    setPath('/public/whiteboard/wb-1');
    mockGetGuestName.value = 'Alice B.'; // the trailing period is rejected by the validator
    expect(resolveWhiteboardGuestIdentity()).toEqual({ isPublicRoute: true, guestName: undefined });
  });

  it('on the public route with no stored name → public, no guest name', () => {
    setPath('/public/whiteboard/wb-1');
    mockGetGuestName.value = null;
    expect(resolveWhiteboardGuestIdentity()).toEqual({ isPublicRoute: true, guestName: undefined });
  });
});
