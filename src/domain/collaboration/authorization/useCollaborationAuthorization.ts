import {
  useCollaborationAuthorizationQuery,
  useCollaborationPrivilegesQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '../../../core/apollo/generated/graphql-schema';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { getJourneyTypeName } from '../../journey/JourneyTypeName';
import { CoreEntityIdTypes } from '../../shared/types/CoreEntityIds';

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

export const useCollaborationAuthorization = (journeyLocation?: CoreEntityIdTypes): CollaborationAuthorization => {
  const urlParams = useUrlParams();
  const { spaceNameId, challengeNameId, opportunityNameId } = journeyLocation ?? urlParams;

  const journeyTypeName = getJourneyTypeName(urlParams);
  const [includeSpace, includeChallenge, includeOpportunity] = [
    journeyTypeName === 'space',
    journeyTypeName === 'challenge',
    journeyTypeName === 'opportunity',
  ];

  const { data: authorizationData, loading: loadingAuthorization } = useCollaborationAuthorizationQuery({
    variables: {
      spaceNameId: spaceNameId!,
      challengeNameId: challengeNameId,
      opportunityNameId: opportunityNameId,
      includeSpace,
      includeChallenge,
      includeOpportunity,
    },
    skip: !spaceNameId,
  });
  const authorization = (
    authorizationData?.space.opportunity ??
    authorizationData?.space.challenge ??
    authorizationData?.space
  )?.authorization;
  const canReadCollaboration = (authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Read);

  const { data: collaborationData, loading: loadingCollaboration } = useCollaborationPrivilegesQuery({
    variables: {
      spaceNameId: spaceNameId!,
      challengeNameId: challengeNameId,
      opportunityNameId: opportunityNameId,
      includeSpace,
      includeChallenge,
      includeOpportunity,
    },
    skip: !spaceNameId || !canReadCollaboration,
  });

  const collaboration =
    collaborationData?.space.collaboration ??
    collaborationData?.space.challenge?.collaboration ??
    collaborationData?.space.opportunity?.collaboration;

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
