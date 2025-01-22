import { RoleName } from '@/core/apollo/generated/graphql-schema';
import useRoleSetAdminAvailableUsersOnPlatform from './useRoleSetAdminAvailableUsersOnPlatform';
import useRoleSetAdminAvailableUsersOnRoleSet from './useRoleSetAdminAvailableUsersOnRoleSet';
import { Identifiable } from '@/core/utils/Identifiable';
import { AvailableUsersResponse } from './common';

export type AvailableUsersForRoleSearchParams = undefined | {
  enabled: false | undefined;
  mode?: undefined;
  role?: undefined;
  filter?: undefined;
} | ({
  enabled: true;
  filter?: string;
} & (
    | {
      mode: 'platform';
      role?: RoleName;
    }
    | {
      mode: 'roleSet';
      role: RoleName;
    }
  )
  );

type useRoleSetAdminAvailableUsersParams = AvailableUsersForRoleSearchParams & {
  roleSetId: string | undefined;
  usersAlreadyInRole?: Identifiable[];
}

const useRoleSetAdminAvailableUsers = ({
  roleSetId,
  mode,
  role,
  enabled,
  filter,
  usersAlreadyInRole,
}: useRoleSetAdminAvailableUsersParams): AvailableUsersResponse => {
  const availableUsersForRoleSetRole = useRoleSetAdminAvailableUsersOnRoleSet({
    roleSetId: roleSetId,
    role: role,
    filter: filter,
    skip:
      !enabled || mode !== 'roleSet' || !role,
    usersAlreadyInRole,
  });

  const availableUsersForPlatformRoleSetRole = useRoleSetAdminAvailableUsersOnPlatform({
    filter: filter,
    skip:
      !enabled || mode !== 'platform',
    usersAlreadyInRole,
  });

  const availableUsersForRole =
    mode === 'roleSet'
      ? availableUsersForRoleSetRole
      : mode === 'platform'
        ? availableUsersForPlatformRoleSetRole
        : undefined;

  return availableUsersForRole;
}

export default useRoleSetAdminAvailableUsers;
