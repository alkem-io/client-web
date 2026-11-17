import { beforeEach, describe, expect, test, vi } from 'vitest';

const { createUploadLinkMock, createClientMock, routeToSecondFactorMock } = vi.hoisted(() => ({
  createUploadLinkMock: vi.fn(() => ({ __mock: 'uploadLink' })),
  createClientMock: vi.fn(() => ({ subscribe: vi.fn(), dispose: vi.fn() })),
  routeToSecondFactorMock: vi.fn(),
}));

vi.mock('graphql-ws', async importOriginal => ({
  ...(await importOriginal<typeof import('graphql-ws')>()),
  createClient: createClientMock,
}));

vi.mock('@/core/auth/authentication/routeToSecondFactor', () => ({
  routeToSecondFactor: routeToSecondFactorMock,
}));

vi.mock('apollo-upload-client/createUploadLink.mjs', () => ({
  default: createUploadLinkMock,
}));

vi.mock('@/main/env', () => ({
  env: { VITE_APP_ALKEMIO_DOMAIN: 'http://localhost' },
}));

import { httpLink } from './httpLink';

describe('httpLink', () => {
  test('passes credentials: "include" to createUploadLink so the alkemio_session cookie is sent on every GraphQL request', () => {
    httpLink('/graphql', false);

    expect(createUploadLinkMock).toHaveBeenCalledTimes(1);
    expect(createUploadLinkMock).toHaveBeenCalledWith(
      expect.objectContaining({
        uri: '/graphql',
        credentials: 'include',
      })
    );
  });

  describe('subscription socket closed by the server', () => {
    type ClosedHandler = (event: unknown) => void;
    const closedHandler = (): ClosedHandler => {
      httpLink('/graphql', true);
      const options = (createClientMock.mock.calls[0] as unknown as [{ on: { closed: ClosedHandler } }])[0];
      return options.on.closed;
    };

    beforeEach(() => {
      createClientMock.mockClear();
      routeToSecondFactorMock.mockClear();
    });

    test('a 4403 close (session refused for a missing second factor) routes to the second-factor page', () => {
      closedHandler()({ code: 4403, reason: 'Second factor required' });
      expect(routeToSecondFactorMock).toHaveBeenCalledTimes(1);
    });

    test('a normal close does not', () => {
      closedHandler()({ code: 1000, reason: 'Normal Closure' });
      expect(routeToSecondFactorMock).not.toHaveBeenCalled();
    });
  });
});
