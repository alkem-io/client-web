import type { RoleName } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { AvailableUsersResponse } from './common';
import useRoleSetAvailableUsersOnPlatform from './useRoleSetAvailableUsersOnPlatform';
import useRoleSetAvailableUsersOnRoleSet from './useRoleSetAvailableUsersOnRoleSet';

type AvailableUsersForRoleSearchParams = {
  skip?: boolean;
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
);

type useRoleSetAvailableUsersParams = AvailableUsersForRoleSearchParams & {
  roleSetId: string | undefined;
  usersAlreadyInRole?: Identifiable[]; // Only used for platform mode
};

const useRoleSetAvailableUsers = ({
  roleSetId,
  mode,
  role,
  skip,
  filter,
  usersAlreadyInRole,
}: useRoleSetAvailableUsersParams): AvailableUsersResponse => {
  const availableUsersForRoleSetRole = useRoleSetAvailableUsersOnRoleSet({
    roleSetId: roleSetId,
    role: role,
    filter: filter,
    skip: skip || mode !== 'roleSet' || !role,
  });

  const availableUsersForPlatformRoleSetRole = useRoleSetAvailableUsersOnPlatform({
    filter: filter,
    skip: skip || mode !== 'platform',
    usersAlreadyInRole,
  });

  const availableUsersForRole =
    mode === 'roleSet' ? availableUsersForRoleSetRole : availableUsersForPlatformRoleSetRole;

  return availableUsersForRole;
};

export default useRoleSetAvailableUsers;
