import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import type { V2FoundationQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { foundationTestData, memberFoundationTestData } from '@/core/foundation/foundationTestData';
import { NativeFoundationContext } from '@/core/foundation/NativeFoundationProvider';
import { MatrixSession } from './MatrixSessionProvider';
import { establishSession } from './sessionController';

vi.mock('./sessionController', () => ({ establishSession: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const endpoint = '/api/matrix';
const bootstrap = vi.mocked(establishSession);
const viewer = memberFoundationTestData().viewer;
const matrix = {
  userId: `@${viewer.id}:platform.example.test`,
  sessionBaseUrl: endpoint,
  expiresAt: '2099-01-01T00:00:00Z',
};

const mount = (data: V2FoundationQuery, pathname = '/spaces') => (
  <MemoryRouter initialEntries={[pathname]}>
    <NativeFoundationContext value={{ data, loading: false, error: undefined, refetch: vi.fn() }}>
      <MatrixSession sessionBaseUrl={endpoint} />
    </NativeFoundationContext>
  </MemoryRouter>
);

afterEach(() => bootstrap.mockReset());

it('starts a platform-session client only for the admitted viewer and aborts its lifetime when signed out', async () => {
  bootstrap.mockImplementation(async (_, __, signal) => {
    await new Promise<void>(resolve => signal.addEventListener('abort', () => resolve(), { once: true }));
  });
  const signedOut = foundationTestData();
  const { rerender } = render(mount(signedOut));
  expect(bootstrap).not.toHaveBeenCalled();
  rerender(mount({ viewer: { ...viewer, matrix } }));
  await waitFor(() => expect(bootstrap).toHaveBeenCalledTimes(1));

  const [base, access, signal] = bootstrap.mock.calls[0];
  expect(base).toBe(endpoint);
  expect(access).toEqual(matrix);
  expect(signal.aborted).toBe(false);
  rerender(mount(signedOut));
  expect(signal.aborted).toBe(true);
});

it('does not start a session again when the authenticated browser is already on the logout route', () => {
  render(mount({ viewer: { ...viewer, matrix } }, '/logout'));
  expect(bootstrap).not.toHaveBeenCalled();
});
