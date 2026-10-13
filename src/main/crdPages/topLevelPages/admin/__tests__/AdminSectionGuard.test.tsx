import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import CrdAdminRoutes from '../CrdAdminRoutes';

// jsdom does not implement scrollIntoView, but the shell's tab strip calls it
// in a layout effect on the active tab (see also CrdDiscussionPage.test.tsx).
beforeAll(() => {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

// 027-platform-role-redesign L6 (client-5): `AdminSectionGuard` and
// `useVisibleAdminSections` must read the same answer as the nav filter in
// `CrdAdminShellPage` — this test drives the real route tree so a hidden
// section deep-linked directly redirects instead of rendering and failing
// server-side.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated: true, loading: false }),
}));

let usePlatformLevelAuthorizationQueryResult: { data: unknown; loading: boolean } = {
  data: undefined,
  loading: false,
};
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformLevelAuthorizationQuery: () => usePlatformLevelAuthorizationQueryResult,
}));

// Only the two sections these tests actually navigate to ever get their lazy
// chunk requested (React Router only renders the matched Route's element) —
// the other eight stay unmocked and untouched.
vi.mock('../users/CrdAdminUsersRoutes', () => ({
  default: () => <div data-testid="page-users" />,
}));
vi.mock('../licensing/CrdAdminLicensingPage', () => ({
  default: () => <div data-testid="page-licensing" />,
}));

const arrange = ({
  platform = [],
  roleSet = [],
  myRoles = [],
  loading = false,
  path,
}: {
  platform?: string[];
  roleSet?: string[];
  myRoles?: string[];
  loading?: boolean;
  path: string;
}) => {
  usePlatformLevelAuthorizationQueryResult = loading
    ? { data: undefined, loading: true }
    : {
        data: {
          platform: {
            authorization: { myPrivileges: platform },
            roleSet: { myRoles, authorization: { myPrivileges: roleSet } },
          },
        },
        loading: false,
      };

  const LocationProbe = () => {
    const location = useLocation();
    return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
  };

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/*" element={<CrdAdminRoutes />} />
        <Route path="/restricted" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AdminSectionGuard', () => {
  test('a License Manager deep-linking /admin/users (a section it cannot see) is redirected to /restricted with the origin', async () => {
    arrange({
      platform: ['PLATFORM_LICENSING_LISTS_READ'],
      myRoles: ['PLATFORM_LICENSE_MANAGER'],
      path: '/admin/users',
    });

    expect(await screen.findByTestId('location')).toHaveTextContent('/restricted?origin=%2Fadmin%2Fusers');
    expect(screen.queryByTestId('page-users')).not.toBeInTheDocument();
  });

  test('the same License Manager reaches /admin/licensing, its own section', async () => {
    arrange({
      platform: ['PLATFORM_LICENSING_LISTS_READ'],
      myRoles: ['PLATFORM_LICENSE_MANAGER'],
      path: '/admin/licensing',
    });

    expect(await screen.findByTestId('page-licensing')).toBeInTheDocument();
  });

  // Slice B (T013): the retired PLATFORM_ADMIN catch-all admits no section — the
  // admin-area guard turns the holder away before any section guard runs.
  test('a holder of only the retired PLATFORM_ADMIN is redirected from /admin/users', async () => {
    arrange({ platform: ['PLATFORM_ADMIN'], path: '/admin/users' });

    expect(await screen.findByTestId('location')).toHaveTextContent(/^\/restricted\?origin=/);
    expect(screen.queryByTestId('page-users')).not.toBeInTheDocument();
  });

  test('renders Loading while the privilege query is in flight', () => {
    arrange({ loading: true, path: '/admin/users' });

    expect(screen.getByText('Loading user privileges')).toBeInTheDocument();
  });
});
