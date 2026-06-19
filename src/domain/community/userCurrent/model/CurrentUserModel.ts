import type { AuthorizationPrivilege, LicenseEntitlementType, RoleName } from '@/core/apollo/generated/graphql-schema';
import type { UserModel } from '../../user/models/UserModel';
import type { PlatformPrivilegeWrapper } from '../CurrentUserProvider/usePlatformPrivilegeWrapper';

export interface CurrentUserModel {
  platformPrivilegeWrapper: PlatformPrivilegeWrapper | undefined;
  userModel: UserModel | undefined;
  accountId: string | undefined;
  loading: boolean;
  loadingMe: boolean;
  verified: boolean;
  isAuthenticated: boolean;
  platformRoles: RoleName[];
  accountPrivileges: AuthorizationPrivilege[];
  accountEntitlements: LicenseEntitlementType[];
}
