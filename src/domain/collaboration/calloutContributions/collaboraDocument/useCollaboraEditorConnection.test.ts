import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mapCollaboraFooterProps = vi.fn((_args: { terminalReason: string | null }) => ({ changesAtRisk: false }));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated: true }),
}));
vi.mock('./useCollaboraConnectionMonitor', () => ({
  useCollaboraConnectionMonitor: () => ({
    status: 'connected',
    cause: null,
    saveStatus: 'saved',
    connectedUsers: [],
    reconnect: vi.fn(),
    reconnectNonce: 0,
  }),
}));
vi.mock('./useProactiveTokenRefresh', () => ({ useProactiveTokenRefresh: () => undefined }));
vi.mock('./useCollaboraSaveHealth', () => ({ useCollaboraSaveHealth: () => ({ serviceUnavailable: false }) }));
vi.mock('./collaboraFooterMapper', () => ({
  mapCollaboraFooterProps: (args: { terminalReason: string | null }) => mapCollaboraFooterProps(args),
}));

import { useCollaboraEditorConnection } from './useCollaboraEditorConnection';

const terminalReasonAfterFetchError = (code: string | undefined) => {
  const { result } = renderHook(() => useCollaboraEditorConnection('doc-1'));
  act(() => result.current.onFetchError(code));
  const calls = mapCollaboraFooterProps.mock.calls;
  return calls[calls.length - 1][0].terminalReason;
};

describe('useCollaboraEditorConnection — editor-URL fetch errors', () => {
  beforeEach(() => {
    mapCollaboraFooterProps.mockClear();
  });

  it.each([
    ['FORBIDDEN_POLICY', 'notFound'],
    ['ENTITY_NOT_FOUND', 'notFound'],
    ['RELATIONSHIP_NOT_FOUND', 'notFound'],
    ['FORBIDDEN', 'forbidden'],
  ])('treats %s as terminal with the %s reason', (code, reason) => {
    expect(terminalReasonAfterFetchError(code)).toBe(reason);
  });

  it.each(['STORAGE_SERVICE_UNAVAILABLE', undefined])('treats %s as recoverable', code => {
    expect(terminalReasonAfterFetchError(code)).toBeNull();
  });
});
