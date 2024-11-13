import {
  useCollaborationAuthorizationQuery,
  useCollaborationPrivilegesQuery,
} from '@core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@core/apollo/generated/graphql-schema';

interface CollaborationAuthorizationParams {
  journeyId: string | undefined;
}

interface CollaborationAuthorization {
  collaborationId: string | undefined;
  collaborationPrivileges: AuthorizationPrivilege[];
  canReadCollaboration: boolean;
  canCreateCallout: boolean;
  canSaveAsTemplate: boolean;
  canReadCallout: boolean;
  loading: boolean;
}

export const useCollaborationAuthorization = ({
  journeyId,
}: CollaborationAuthorizationParams): CollaborationAuthorization => {
  const { data: authorizationData, loading: loadingAuthorization } = useCollaborationAuthorizationQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !journeyId,
  });

  const authorization = authorizationData?.lookup.space?.authorization;

  const canReadCollaboration = (authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Read);

  const { data: collaborationData, loading: loadingCollaboration } = useCollaborationPrivilegesQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !journeyId || !canReadCollaboration,
  });

  const collaboration = collaborationData?.lookup.space?.collaboration;

  const collaborationId = collaboration?.id;
  const collaborationPrivileges = collaboration?.authorization?.myPrivileges ?? [];

  const canCreateCallout = collaborationPrivileges.includes(AuthorizationPrivilege.CreateCallout);
  // TODO: For now Create Callout from template will use the same permission as to save a template from an existing callout
  const canSaveAsTemplate = collaborationPrivileges.includes(AuthorizationPrivilege.SaveAsTemplate);
  const canReadCallout = collaborationPrivileges.includes(AuthorizationPrivilege.Read);

  return {
    collaborationId,
    collaborationPrivileges,
    canReadCollaboration,
    canCreateCallout,
    canSaveAsTemplate,
    canReadCallout,
    loading: loadingAuthorization || loadingCollaboration,
  };
};
