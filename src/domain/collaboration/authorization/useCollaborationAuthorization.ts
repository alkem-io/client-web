import { useCollaborationAuthorizationEntitlementsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';

type CollaborationAuthorizationEntitlementsParams = {
  collaborationId: string | undefined;
};

type CollaborationAuthorization = {
  collaborationPrivileges: AuthorizationPrivilege[];
  canCreateCallout: boolean;
  canSaveAsTemplate: boolean;
  entitledToSaveAsTemplate: boolean;
  canReadCallout: boolean;
  loading: boolean;
};

export const useCollaborationAuthorizationEntitlements = ({
  collaborationId,
}: CollaborationAuthorizationEntitlementsParams): CollaborationAuthorization => {
  const { data: collaborationData, loading: loadingCollaboration } = useCollaborationAuthorizationEntitlementsQuery({
    variables: {
      collaborationId: collaborationId!,
    },
    skip: !collaborationId,
  });

  const collaborationPrivileges = collaborationData?.lookup.collaboration?.authorization?.myPrivileges ?? [];
  const collaborationEntitlements = collaborationData?.lookup.collaboration?.license?.availableEntitlements ?? [];
  const canCreateCallout = collaborationPrivileges.includes(AuthorizationPrivilege.CreateCallout);
  const canSaveAsTemplate = collaborationEntitlements.includes(LicenseEntitlementType.SpaceFlagSaveAsTemplate);
  const canReadCallout = collaborationPrivileges.includes(AuthorizationPrivilege.Read);

  const license = collaborationData?.lookup.collaboration?.license;
  const entitledToSaveAsTemplate =
    license?.availableEntitlements?.includes(LicenseEntitlementType.SpaceFlagSaveAsTemplate) ?? false;

  return {
    collaborationPrivileges,
    canCreateCallout,
    canSaveAsTemplate,
    entitledToSaveAsTemplate,
    canReadCallout,
    loading: loadingCollaboration,
  };
};
