import { useSpacePermissionsAndEntitlementsQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpacePermissions } from '../SpaceContext/SpaceContext';
import { useSpace } from '../SpaceContext/useSpace';
import { AuthorizationPrivilege, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import { useMemo } from 'react';

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
  const { space, permissions, loading } = useSpace();
  const { data: permissionsData, loading: loadingEntitlements } = useSpacePermissionsAndEntitlementsQuery({
    variables: {
      spaceId: space?.id,
    },
    skip: !space?.id,
  });

  const result: useSpacePermissionsAndEntitlementsProvided = useMemo(
    () => ({
      permissions: {
        ...permissions,
        canSaveAsTemplate:
          permissionsData?.lookup.space?.templatesManager?.authorization?.myPrivileges?.includes(
            AuthorizationPrivilege.Update
          ) ?? permissions.canCreateTemplates,
      },
      entitlements: {
        entitledToSaveAsTemplate:
          permissionsData?.lookup.space?.collaboration.license.availableEntitlements?.includes(
            LicenseEntitlementType.SpaceFlagSaveAsTemplate
          ) ?? false,
      },
      loading: loading || loadingEntitlements,
    }),
    [space.id, permissionsData, permissions, loading, loadingEntitlements]
  );

  return result;
};

export default useSpacePermissionsAndEntitlements;
