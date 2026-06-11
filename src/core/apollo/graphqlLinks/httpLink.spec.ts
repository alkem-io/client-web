import { describe, expect, test, vi } from 'vitest';

const { createUploadLinkMock } = vi.hoisted(() => ({
  createUploadLinkMock: vi.fn(() => ({ __mock: 'uploadLink' })),
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
});
