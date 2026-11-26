import { LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import type { SpacePermissions } from '../context/SpaceContext';
import { pageSpace } from '../context/spacePageShellMapper';
import { useSpace } from '../context/useSpace';
import { useSpacePageData } from './useSpacePage';

type useSpacePermissionsAndEntitlementsProvided = {
  permissions: SpacePermissions & {
    canSaveAsTemplate: boolean;
  };
  entitlements: {
    entitledToSaveAsTemplate: boolean;
  };
  loading: boolean;
};
const useSpacePermissionsAndEntitlements = (): useSpacePermissionsAndEntitlementsProvided => {
  // The level-zero space's D2 document (SpaceCan.saveAsTemplate) and its entitlements, both from the page cache.
  const { space, permissions, entitlements, loading } = useSpace();
  const doc = pageSpace(useSpacePageData(space?.id || undefined, 'space')?.node, space?.id);

  const result: useSpacePermissionsAndEntitlementsProvided = {
    permissions: {
      ...permissions,
      canSaveAsTemplate: doc?.can.saveAsTemplate ?? permissions.canCreateTemplates,
    },
    entitlements: {
      entitledToSaveAsTemplate: entitlements.includes(LicenseEntitlementType.SpaceFlagSaveAsTemplate),
    },
    loading,
  };

  return result;
};

export default useSpacePermissionsAndEntitlements;
