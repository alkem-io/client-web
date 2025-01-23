import { RoleName } from '@/core/apollo/generated/graphql-schema';
import useRoleSetAvailableUsersOnPlatform from './useRoleSetAvailableUsersOnPlatform';
import useRoleSetAvailableUsersOnRoleSet from './useRoleSetAvailableUsersOnRoleSet';
import { Identifiable } from '@/core/utils/Identifiable';
import { AvailableUsersResponse } from './common';

export type AvailableUsersForRoleSearchParams = {
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
  usersAlreadyInRole?: Identifiable[];
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
    usersAlreadyInRole,
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
