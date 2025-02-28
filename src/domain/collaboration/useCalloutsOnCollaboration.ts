import { CalloutGroupName, CalloutsQueryVariables } from '@/core/apollo/generated/graphql-schema';
import { useCollaborationAuthorizationEntitlements } from '@/domain/collaboration/authorization/useCollaborationAuthorization';
import useCallouts, { TypedCallout } from './calloutsSet/useCallouts/useCallouts';

interface UseCalloutsOnCollaborationParams {
  collaborationId: string | undefined;
  groupNames?: CalloutGroupName[];
}

export interface OrderUpdate {
  (relatedCalloutIds: string[]): string[];
}

export interface UseCalloutsOnCollaborationProvided {
  callouts: TypedCallout[] | undefined;
  groupedCallouts: Record<CalloutGroupName, TypedCallout[] | undefined>;
  canCreateCallout: boolean;
  canReadCalloutsSet: boolean;
  loading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
}

/**
 * Custom hook to manage callouts within a collaboration context.
 *
 * This hook is a wrapper over `useCallouts` to extract the collaboration logic from it.
 * It provides additional functionality specific to collaboration, such as authorization entitlements.
 *
 * If you need Callouts without a group, don't specify groupNames at all.
 */
const useCalloutsOnCollaboration = ({
  collaborationId,
  groupNames,
}: UseCalloutsOnCollaborationParams): UseCalloutsOnCollaborationProvided => {
  const {
    canSaveAsTemplate,
    entitledToSaveAsTemplate,
    calloutsSetId,
    loading: authorizationLoading,
  } = useCollaborationAuthorizationEntitlements({ collaborationId });

  const {
    callouts,
    groupedCallouts,
    canCreateCallout,
    canReadCalloutsSet: canReadCallout,
    loading: calloutsSetLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  } = useCallouts({
    calloutsSetId,
    collaborationId,
    canSaveAsTemplate,
    entitledToSaveAsTemplate,
    groupNames,
  });

  return {
    callouts,
    groupedCallouts,
    canCreateCallout,
    canReadCalloutsSet: canReadCallout,
    loading: calloutsSetLoading || authorizationLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  };
};

export default useCalloutsOnCollaboration;
