import { useCollaborationAuthorizationEntitlementsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';

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
  // For now we always save as template to the current space, but in the future we may want to be able to choose an InnovationPack to save a callout to, and this would make no sense.
  // Remove this, and the templateSet privileges query from the SpaceProvider query
  const { permissions } = useSpace();

  const { data: collaborationData, loading: loadingCollaboration } = useCollaborationAuthorizationEntitlementsQuery({
    variables: {
      collaborationId: collaborationId!,
    },
    skip: !collaborationId,
  });

  const collaborationPrivileges = collaborationData?.lookup.collaboration?.authorization?.myPrivileges ?? [];
  const collaborationEntitlements = collaborationData?.lookup.collaboration?.license?.availableEntitlements ?? [];
  const canCreateCallout = collaborationPrivileges.includes(AuthorizationPrivilege.CreateCallout);
  const canSaveAsTemplate = permissions.canCreateTemplates;
  const canReadCallout = collaborationPrivileges.includes(AuthorizationPrivilege.Read);

  const entitledToSaveAsTemplate =
    collaborationEntitlements?.includes(LicenseEntitlementType.SpaceFlagSaveAsTemplate) ?? false;

  return {
    collaborationPrivileges,
    canCreateCallout,
    canSaveAsTemplate,
    entitledToSaveAsTemplate,
    canReadCallout,
    loading: loadingCollaboration,
  };
};
