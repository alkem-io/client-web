import { useState } from 'react';
import {
  useAuthorizationPolicyQuery,
  useAuthorizationPrivilegesForUserQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPolicyInspector,
  type AuthorizationPolicyView,
} from '@/crd/components/admin/authorizationPolicies/AuthorizationPolicyInspector';
import { UserPrivilegesLookup } from '@/crd/components/admin/authorizationPolicies/UserPrivilegesLookup';
import useAdminGlobalUserList from '@/domain/platformAdmin/domain/users/useAdminGlobalUserList';

/**
 * CRD global-admin Authorization Policies inspector. Reuses
 * `useAuthorizationPolicyQuery` (policy by id),
 * `useAuthorizationPrivilegesForUserQuery` (per-user privileges), and
 * `useAdminGlobalUserList` (user search) — all verbatim.
 */
const CrdAdminAuthorizationPoliciesPage = () => {
  const [policyIdInput, setPolicyIdInput] = useState('');
  const [policyId, setPolicyId] = useState('');

  const { data, loading } = useAuthorizationPolicyQuery({
    variables: { authorizationPolicyId: policyId },
    skip: !policyId,
  });
  const authorizationPolicy = data?.lookup.authorizationPolicy;
  const policy: AuthorizationPolicyView | undefined = authorizationPolicy
    ? {
        id: authorizationPolicy.id,
        type: authorizationPolicy.type ?? undefined,
        credentialRules: (authorizationPolicy.credentialRules ?? []).map(rule => ({
          name: rule.name ?? undefined,
          cascade: rule.cascade,
          grantedPrivileges: rule.grantedPrivileges.map(String),
          criterias: rule.criterias.map(criteria => ({
            type: String(criteria.type),
            resourceID: criteria.resourceID ?? undefined,
          })),
        })),
        privilegeRules: (authorizationPolicy.privilegeRules ?? []).map(rule => ({
          name: rule.name ?? undefined,
          sourcePrivilege: String(rule.sourcePrivilege),
          grantedPrivileges: rule.grantedPrivileges.map(String),
        })),
      }
    : undefined;
  const notFound = Boolean(policyId) && !loading && !authorizationPolicy;

  // Per-user privileges lookup.
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const {
    userList,
    loading: loadingUsers,
    onSearchTermChange,
    searchTerm,
  } = useAdminGlobalUserList({
    skip: !policyId,
    pageSize: 20,
  });
  const users = userList.map(user => ({ id: user.id, label: user.value }));
  const selectedUser = userList.find(user => user.id === selectedUserId);

  const { data: privilegesData, loading: loadingPrivileges } = useAuthorizationPrivilegesForUserQuery({
    variables: { authorizationPolicyId: policyId, userId: selectedUserId ?? '' },
    skip: !policyId || !selectedUserId,
  });
  const userPrivileges = privilegesData?.lookup.authorizationPrivilegesForUser?.map(String);

  return (
    <AuthorizationPolicyInspector
      policyIdInput={policyIdInput}
      onPolicyIdInputChange={setPolicyIdInput}
      onLookup={() => setPolicyId(policyIdInput.trim())}
      loading={loading}
      policy={policy}
      notFound={notFound}
      userPrivilegesSlot={
        <UserPrivilegesLookup
          searchTerm={searchTerm}
          onSearchTermChange={onSearchTermChange}
          users={users}
          loadingUsers={loadingUsers}
          selectedLabel={selectedUser?.value}
          onSelectUser={setSelectedUserId}
          privileges={userPrivileges}
          loadingPrivileges={loadingPrivileges}
        />
      }
    />
  );
};

export default CrdAdminAuthorizationPoliciesPage;
