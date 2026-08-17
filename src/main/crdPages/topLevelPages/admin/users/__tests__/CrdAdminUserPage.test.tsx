import { render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import CrdAdminUserPage from '../CrdAdminUserPage';

/**
 * 027 — the admin user editor is reachable by roles that may READ a user record
 * and not UPDATE it. Platform Users Admin holds `[PLATFORM_USERS_ADMIN, READ,
 * READ_USER_SETTINGS, READ_USER_PII]` on another user (verified live
 * 2026-08-10) and `updateUser` is gated on UPDATE, so the form used to offer
 * every field and 403 on save.
 */

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('react-router-dom', () => ({ useParams: () => ({ userId: 'user-1' }) }));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

const updateUser = vi.fn(() => Promise.resolve({}));
const userQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserQuery: () => userQueryMock(),
  useUpdateUserMutation: () => [updateUser, { loading: false }],
}));

const userWithPrivileges = (myPrivileges: AuthorizationPrivilege[]) => ({
  data: {
    lookup: {
      user: {
        id: 'user-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@alkem.io',
        phone: '',
        profile: {
          id: 'profile-1',
          displayName: 'Ada Lovelace',
          tagline: '',
          description: '',
          location: { id: 'loc-1', country: '', city: '' },
          references: [],
          tagsets: [],
          url: '/user/ada',
        },
        authorization: { id: 'auth-1', myPrivileges },
      },
    },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CrdAdminUserPage — read-only when the viewer cannot update', () => {
  test('a viewer WITH Update edits the record: fields enabled, Save offered', () => {
    userQueryMock.mockReturnValue(userWithPrivileges([AuthorizationPrivilege.Read, AuthorizationPrivilege.Update]));

    render(<CrdAdminUserPage />);

    expect(screen.getByRole('button', { name: 'userForm.save' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Ada')).not.toBeDisabled();
  });

  test('a Users Admin (READ + PII, no UPDATE) gets no Save and no editable field', () => {
    userQueryMock.mockReturnValue(
      userWithPrivileges([
        AuthorizationPrivilege.PlatformUsersAdmin,
        AuthorizationPrivilege.Read,
        AuthorizationPrivilege.ReadUserPii,
      ])
    );

    render(<CrdAdminUserPage />);

    expect(screen.queryByRole('button', { name: 'userForm.save' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('userForm.readOnlyNotice');
    expect(screen.getByDisplayValue('Ada')).toBeDisabled();
    expect(screen.getByDisplayValue('Lovelace')).toBeDisabled();
  });

  test('the way off the page stays available in read-only', () => {
    userQueryMock.mockReturnValue(userWithPrivileges([AuthorizationPrivilege.Read]));

    render(<CrdAdminUserPage />);

    expect(screen.getByRole('button', { name: 'userForm.back' })).toBeEnabled();
  });

  test('a missing authorization block is treated as no permission, never as permission', () => {
    const missing = userWithPrivileges([]);
    // @ts-expect-error — deliberately modelling a server response without the field
    missing.data.lookup.user.authorization = null;
    userQueryMock.mockReturnValue(missing);

    render(<CrdAdminUserPage />);

    expect(screen.queryByRole('button', { name: 'userForm.save' })).not.toBeInTheDocument();
  });
});
