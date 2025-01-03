import { CalloutsQueryVariables } from '@/core/apollo/generated/graphql-schema';
import useCallouts, { TypedCallout } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import { OrderUpdate } from '@/domain/collaboration/useCalloutsOnCollaboration';
import { useVirtualContributorKnowledgeBaseQuery } from '@/core/apollo/generated/apollo-hooks';

interface useKnowledgeBaseParams {
  id: string | undefined;
}

interface useKnowledgeBaseProvided {
  callouts: TypedCallout[] | undefined;
  calloutsSetId: string;
  canCreateCallout: boolean;
  canReadCalloutsSet: boolean;
  loading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
}

/**
 * Custom hook to manage callouts within a Knowledge base context.
 *
 * This hook is a wrapper over `useCallouts` to extract callouts.
 * It provides additional functionality specific to VCs Knowledge base, but it could be extended to support types.
 *
 */
const useKnowledgeBase = ({ id }: useKnowledgeBaseParams): useKnowledgeBaseProvided => {
  const { data: knowledgeBaseData, loading: knowledgeBaseLoading } = useVirtualContributorKnowledgeBaseQuery({
    variables: {
      id: id!,
    },
    skip: !id,
  });
  const calloutsSetId = knowledgeBaseData?.virtualContributor?.knowledgeBase?.calloutsSet?.id ?? '';

  const {
    callouts,
    canCreateCallout,
    canReadCalloutsSet,
    loading: calloutsSetLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  } = useCallouts({
    calloutsSetId,
    canSaveAsTemplate: false,
    entitledToSaveAsTemplate: false,
  });

  return {
    callouts,
    calloutsSetId,
    canCreateCallout,
    canReadCalloutsSet,
    loading: knowledgeBaseLoading || calloutsSetLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  };
};

export default useKnowledgeBase;
