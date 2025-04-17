import { AuthorizationPrivilege, LicenseEntitlementType, RoleName } from '@/core/apollo/generated/graphql-schema';
import { UserWrapper } from '../CurrentUserProvider/useUserWrapper';
import { UserModel } from '../../user/models/UserModel';

export interface CurrentUserModel {
  userWrapper: UserWrapper | undefined;
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
