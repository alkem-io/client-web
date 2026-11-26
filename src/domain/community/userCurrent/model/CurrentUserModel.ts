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
  // Native account API exposes the combined create verdict, not a raw privilege list.
  accountPrivileges?: AuthorizationPrivilege[];
  accountCanCreate?: ReadonlyArray<{ kind: string; allowed: boolean; reason?: string | null }>;
  nativePlatformPrivileges?: readonly string[];
  accountEntitlements: LicenseEntitlementType[];
}
