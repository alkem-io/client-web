import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TopLevelRoutes } from './TopLevelRoutes';

// root.tsx mounts the foundation observation above TopLevelRoutes; these routing tests stand in an anonymous one.
vi.mock('@/core/foundation/NativeFoundationProvider', async () => {
  const { foundationTestData } = await import('@/core/foundation/foundationTestData');
  return {
    useNativeFoundation: () => ({ data: foundationTestData(), loading: false, error: undefined, refetch: vi.fn() }),
  };
});
vi.mock('@/core/auth/authentication/routing/IdentityRoute', () => ({ IdentityRoute: () => null }));
vi.mock('@/main/ui/layout/CrdLayoutWrapper', () => ({
  CrdLayoutWrapper: ({ children }: PropsWithChildren) => children,
}));
vi.mock('@/main/crdPages/spaces/SpaceExplorerPage', () => ({
  default: () => <main>Explorer measurement is available</main>,
}));
vi.mock('@/core/ui/loading/Loading', () => ({ default: () => <div>Route fallback</div> }));
vi.mock('@/domain/platform/routes/RedirectToLanding', () => ({ default: () => <main>Landing redirect</main> }));
vi.mock('@/main/crdPages/error/CrdRestrictedRoute', () => ({ CrdRestrictedRoute: () => <main>Restricted page</main> }));
vi.mock('@/main/crdPages/topLevelPages/documentation/CrdDocumentationPage', () => ({
  default: () => <main>Documentation page</main>,
}));

describe('initial explorer route', () => {
  it('makes the page available in the first commit without a lazy route fallback', () => {
    render(
      <MemoryRouter initialEntries={['/spaces']}>
        <MockedProvider>
          <TopLevelRoutes />
        </MockedProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Explorer measurement is available')).toBeInTheDocument();
    expect(screen.queryByText('Route fallback')).not.toBeInTheDocument();
  });
});

describe('legacy static routes (71f8ddcf TopLevelRoutes.tsx)', () => {
  const at = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <TopLevelRoutes />
      </MemoryRouter>
    );

  it('runs the landing redirect at the root', () => {
    at('/');
    expect(screen.getByText('Landing redirect')).toBeInTheDocument();
  });

  it.each(['/help', '/about', '/docs'])('shows the documentation at %s', async path => {
    at(path);
    expect(await screen.findByText('Documentation page')).toBeInTheDocument();
  });

  it('shows the restricted page', () => {
    at('/restricted');
    expect(screen.getByText('Restricted page')).toBeInTheDocument();
  });
});
