import {
  useCollaborationAuthorizationQuery,
  useCollaborationPrivilegesQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '../../../core/apollo/generated/graphql-schema';
import { useRouteResolver } from '../../../main/routing/resolvers/RouteResolver';

interface CollaborationAuthorization {
  collaborationId: string | undefined;
  collaborationPrivileges: AuthorizationPrivilege[];
  canReadCollaboration: boolean;
  canCreateCallout: boolean;
  canCreateCalloutFromTemplate: boolean;
  canSaveAsTemplate: boolean;
  canReadCallout: boolean;
  loading: boolean;
}

export const useCollaborationAuthorization = (): CollaborationAuthorization => {
  const { journeyId, journeyTypeName } = useRouteResolver();

  const [includeSpace, includeChallenge, includeOpportunity] = [
    journeyTypeName === 'space',
    journeyTypeName === 'challenge',
    journeyTypeName === 'opportunity',
  ];

  const { data: authorizationData, loading: loadingAuthorization } = useCollaborationAuthorizationQuery({
    variables: {
      spaceId: journeyId,
      challengeId: journeyId,
      opportunityId: journeyId,
      includeSpace,
      includeChallenge,
      includeOpportunity,
    },
    skip: !journeyId,
  });

  const authorization = (
    authorizationData?.lookup.opportunity ??
    authorizationData?.lookup.challenge ??
    authorizationData?.space
  )?.authorization;

  const canReadCollaboration = (authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Read);

  const { data: collaborationData, loading: loadingCollaboration } = useCollaborationPrivilegesQuery({
    variables: {
      spaceId: journeyId,
      challengeId: journeyId,
      opportunityId: journeyId,
      includeSpace,
      includeChallenge,
      includeOpportunity,
    },
    skip: !journeyId || !canReadCollaboration,
  });

  const collaboration =
    collaborationData?.space?.collaboration ??
    collaborationData?.lookup.challenge?.collaboration ??
    collaborationData?.lookup.opportunity?.collaboration;

  const collaborationId = collaboration?.id;
  const collaborationPrivileges = collaboration?.authorization?.myPrivileges ?? [];

  const canCreateCallout = collaborationPrivileges.includes(AuthorizationPrivilege.CreateCallout);
  // TODO: For now Create Callout from template will use the same permission as to save a template from an existing callout
  const canCreateCalloutFromTemplate = collaborationPrivileges.includes(AuthorizationPrivilege.SaveAsTemplate);
  const canSaveAsTemplate = collaborationPrivileges.includes(AuthorizationPrivilege.SaveAsTemplate);
  const canReadCallout = collaborationPrivileges.includes(AuthorizationPrivilege.Read);

  return {
    collaborationId,
    collaborationPrivileges,
    canReadCollaboration,
    canCreateCallout,
    canCreateCalloutFromTemplate,
    canSaveAsTemplate,
    canReadCallout,
    loading: loadingAuthorization || loadingCollaboration,
  };
};
