import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CrdAdminAuthorizationPoliciesPage from '../CrdAdminAuthorizationPoliciesPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const policyQueryMock = vi.fn();
const privilegesQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAuthorizationPolicyQuery: (opts: unknown) => policyQueryMock(opts),
  useAuthorizationPrivilegesForUserQuery: (opts: unknown) => privilegesQueryMock(opts),
}));
vi.mock('@/domain/platformAdmin/domain/users/useAdminGlobalUserList', () => ({
  default: () => ({ userList: [], loading: false, onSearchTermChange: vi.fn(), searchTerm: '' }),
}));

const policy = {
  id: 'p1',
  type: 'SPACE',
  credentialRules: [
    {
      name: 'rule-a',
      cascade: true,
      grantedPrivileges: ['READ', 'UPDATE'],
      criterias: [{ type: 'global-admin', resourceID: 'r1' }],
    },
  ],
  privilegeRules: [{ name: 'priv-a', sourcePrivilege: 'READ', grantedPrivileges: ['CONTRIBUTE'] }],
};

beforeEach(() => {
  vi.clearAllMocks();
  privilegesQueryMock.mockReturnValue({ data: undefined, loading: false });
});

describe('CrdAdminAuthorizationPoliciesPage', () => {
  test('does not query until an ID is submitted, then shows the policy rules', async () => {
    // Before lookup: query skipped → no data.
    policyQueryMock.mockReturnValue({ data: undefined, loading: false });
    const { rerender } = render(<CrdAdminAuthorizationPoliciesPage />);
    expect(screen.queryByText('authPolicies.credentialRules')).toBeNull();

    // Simulate the resolved query, then submit the lookup.
    policyQueryMock.mockReturnValue({ data: { lookup: { authorizationPolicy: policy } }, loading: false });
    await userEvent.type(screen.getByRole('textbox'), 'p1');
    await userEvent.click(screen.getByRole('button', { name: 'authPolicies.lookup' }));
    rerender(<CrdAdminAuthorizationPoliciesPage />);

    expect(screen.getByText('authPolicies.credentialRules')).toBeInTheDocument();
    expect(screen.getByText('authPolicies.privilegeRules')).toBeInTheDocument();
    expect(screen.getByText('SPACE')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
    expect(screen.getByText('CONTRIBUTE')).toBeInTheDocument();
    expect(screen.getAllByText('READ').length).toBeGreaterThan(0);
  });

  test('shows a not-found message for an unknown policy id', async () => {
    policyQueryMock.mockReturnValue({ data: { lookup: { authorizationPolicy: null } }, loading: false });
    render(<CrdAdminAuthorizationPoliciesPage />);
    await userEvent.type(screen.getByRole('textbox'), 'missing');
    await userEvent.click(screen.getByRole('button', { name: 'authPolicies.lookup' }));
    expect(screen.getByText('authPolicies.notFound')).toBeInTheDocument();
  });
});
