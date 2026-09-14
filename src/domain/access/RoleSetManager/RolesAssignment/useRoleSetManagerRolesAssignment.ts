import type { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import {
  useAssignPlatformRoleToUserMutation,
  useAssignRoleToOrganizationMutation,
  useAssignRoleToUserMutation,
  useAssignRoleToVirtualContributorMutation,
  useRemovePlatformRoleFromUserMutation,
  useRemoveRoleFromOrganizationMutation,
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromVirtualContributorMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { RoleName } from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/evictFromCache';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';

type useRoleSetManagerRolesAssignmentParams = {
  roleSetId: string | undefined;
  refetchRoleSetOnMutation?: boolean;
};

export type useRoleSetManagerRolesAssignmentProvided = {
  assignPlatformRoleToUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  removePlatformRoleFromUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  assignRoleToUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  removeRoleFromUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  assignRoleToOrganization: (organizationId: string, roleName: RoleName) => Promise<unknown>;
  removeRoleFromOrganization: (organizationId: string, roleName: RoleName) => Promise<unknown>;
  assignRoleToVirtualContributor: (vcId: string, roleName: RoleName) => Promise<unknown>;
  removeRoleFromVirtualContributor: (vcId: string, roleName: RoleName) => Promise<unknown>;
  loading: boolean;
};

const AUTHORIZATION_ERROR_CODES: string[] = [
  AlkemioGraphqlErrorCode.FORBIDDEN,
  AlkemioGraphqlErrorCode.FORBIDDEN_POLICY,
];

/**
 * True when the rejection consists of NOTHING BUT authorization errors.
 *
 * Deliberately whole-response, not "contains an authorization error". The global link
 * (`useErrorHandlerLink`) strips the authorization codes and forwards whatever remains to
 * `useApolloErrorHandler`, so it stays silent only when the filtered list is empty. If a
 * response mixes, say, FORBIDDEN with ENTITY_NOT_FOUND, the global handler already
 * notifies for the latter — notifying here as well would give the user two toasts for one
 * failure, which spec FR-006 forbids.
 *
 * The precedence is therefore: any non-authorization content in the response (a GraphQL
 * error with another code, a network error, or a client error) hands ownership to the
 * global handler and this wrapper says nothing.
 */
const isExclusivelyAuthorizationError = (error: unknown): boolean => {
  const apolloError = error as ApolloError | undefined;
  const graphQLErrors = apolloError?.graphQLErrors;

  if (!graphQLErrors?.length) {
    return false;
  }

  if (apolloError?.networkError || apolloError?.clientErrors?.length) {
    return false;
  }

  return graphQLErrors.every(graphqlError =>
    AUTHORIZATION_ERROR_CODES.includes(graphqlError.extensions?.code as string)
  );
};

/**
 * Do not use this hook directly, normally you should use useRoleSetManager instead
 */
const useRoleSetManagerRolesAssignment = ({
  roleSetId,
  refetchRoleSetOnMutation = false,
}: useRoleSetManagerRolesAssignmentParams): useRoleSetManagerRolesAssignmentProvided => {
  const notify = useNotification();
  const { t } = useTranslation('crd-common');

  const refetchQueries = (cache: Parameters<typeof evictFromCache>[0]) => {
    if (refetchRoleSetOnMutation && roleSetId) {
      evictFromCache(cache, roleSetId, 'RoleSet');
    }
  };

  // Platform Roles:
  const [runAssignPlatformRoleToUser, { loading: assignPlatformRoleToUserLoading }] =
    useAssignPlatformRoleToUserMutation();
  const [runRemovePlatformRoleFromUser, { loading: removePlatformRoleFromUserLoading }] =
    useRemovePlatformRoleFromUserMutation();
  const assignPlatformRoleToUser = (userId: string, role: RoleName) => {
    return runAssignPlatformRoleToUser({
      variables: {
        contributorId: userId,
        role,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const removePlatformRoleFromUser = (userId: string, role: RoleName) => {
    return runRemovePlatformRoleFromUser({
      variables: {
        contributorId: userId,
        role,
      },
      update: cache => refetchQueries(cache),
    });
  };

  // Normal RoleSets:
  const [runAssignRoleToUser, { loading: assignRoleToUserLoading }] = useAssignRoleToUserMutation();
  const [runRemoveRoleFromUser, { loading: removeRoleFromUserLoading }] = useRemoveRoleFromUserMutation();
  const assignRoleToUser = (userId: string, role: RoleName) => {
    return runAssignRoleToUser({
      variables: {
        contributorId: userId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const removeRoleFromUser = (userId: string, role: RoleName) => {
    return runRemoveRoleFromUser({
      variables: {
        contributorId: userId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const [runAssignRoleToOrganization, { loading: assignRoleToOrganizationLoading }] =
    useAssignRoleToOrganizationMutation();
  const [runRemoveRoleFromOrganization, { loading: removeRoleFromOrganizationLoading }] =
    useRemoveRoleFromOrganizationMutation();
  const assignRoleToOrganization = (organizationId: string, role: RoleName) => {
    return runAssignRoleToOrganization({
      variables: {
        contributorId: organizationId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const removeRoleFromOrganization = (organizationId: string, role: RoleName) => {
    return runRemoveRoleFromOrganization({
      variables: {
        contributorId: organizationId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const [runAssignRoleToVirtualContributor, { loading: assignRoleToVirtualContributorLoading }] =
    useAssignRoleToVirtualContributorMutation();
  const [runRemoveRoleFromVirtualContributor, { loading: removeRoleFromVirtualContributorLoading }] =
    useRemoveRoleFromVirtualContributorMutation();
  const assignRoleToVirtualContributor = (vcId: string, role: RoleName) => {
    return runAssignRoleToVirtualContributor({
      variables: {
        contributorId: vcId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const removeRoleFromVirtualContributor = (vcId: string, role: RoleName) => {
    return runRemoveRoleFromVirtualContributor({
      variables: {
        contributorId: vcId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
    });
  };
  const loading =
    assignPlatformRoleToUserLoading ||
    removePlatformRoleFromUserLoading ||
    assignRoleToUserLoading ||
    removeRoleFromUserLoading ||
    assignRoleToOrganizationLoading ||
    removeRoleFromOrganizationLoading ||
    assignRoleToVirtualContributorLoading ||
    removeRoleFromVirtualContributorLoading;

  /**
   * Surfaces authorization failures that would otherwise be silent.
   *
   * Scoped deliberately to authorization codes only: every other failure class
   * (validation, network, server) is already reported by the global error link,
   * so notifying here as well would show the user two toasts for one failure.
   * The rejection is always re-thrown so callers still see it.
   */
  const withPermissionErrorNotification =
    <TArgs extends unknown[]>(run: (...args: TArgs) => Promise<unknown>) =>
    async (...args: TArgs) => {
      try {
        return await run(...args);
      } catch (error) {
        if (isExclusivelyAuthorizationError(error)) {
          notify(t('permissions.errorDenied'), 'error');
        }
        throw error;
      }
    };

  const notReady = () => Promise.reject('roleSetId is not defined');
  return {
    assignPlatformRoleToUser: roleSetId ? withPermissionErrorNotification(assignPlatformRoleToUser) : notReady,
    removePlatformRoleFromUser: roleSetId ? withPermissionErrorNotification(removePlatformRoleFromUser) : notReady,
    assignRoleToUser: roleSetId ? withPermissionErrorNotification(assignRoleToUser) : notReady,
    removeRoleFromUser: roleSetId ? withPermissionErrorNotification(removeRoleFromUser) : notReady,
    assignRoleToOrganization: roleSetId ? withPermissionErrorNotification(assignRoleToOrganization) : notReady,
    removeRoleFromOrganization: roleSetId ? withPermissionErrorNotification(removeRoleFromOrganization) : notReady,
    assignRoleToVirtualContributor: roleSetId
      ? withPermissionErrorNotification(assignRoleToVirtualContributor)
      : notReady,
    removeRoleFromVirtualContributor: roleSetId
      ? withPermissionErrorNotification(removeRoleFromVirtualContributor)
      : notReady,
    loading,
  };
};

export default useRoleSetManagerRolesAssignment;
