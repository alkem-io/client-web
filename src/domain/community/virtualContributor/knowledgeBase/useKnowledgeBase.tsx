import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, CalloutsQueryVariables } from '@/core/apollo/generated/graphql-schema';
import useCallouts, { TypedCallout } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';
import { OrderUpdate } from '@/domain/collaboration/useCalloutsOnCollaboration';
import {
  useRefreshBodyOfKnowledgeMutation,
  useUpdateVirtualContributorMutation,
  useVirtualContributorKnowledgeBaseQuery,
  useVirtualContributorKnowledgePrivilegesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';

interface useKnowledgeBaseParams {
  id: string | undefined;
}

interface useKnowledgeBaseProvided {
  callouts: TypedCallout[] | undefined;
  calloutsSetId: string;
  canCreateCallout: boolean;
  canReadCalloutsSet: boolean;
  loading: boolean;
  calloutsSetLoading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsQueryVariables>) => void;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  knowledgeBaseDescription: string | undefined;
  updateDescription: (values: { description: string }) => Promise<void>;
  ingestKnowledge: () => Promise<unknown>;
  ingestLoading: boolean;
  hasReadAccess: boolean;
  loadingPrivileges: boolean;
}

/**
 * Custom hook to manage callouts within a Knowledge base context.
 *
 * This hook is a wrapper over `useCallouts` to extract callouts.
 * It provides additional functionality specific to VCs Knowledge base, but it could be extended to support types.
 *
 */
const useKnowledgeBase = ({ id }: useKnowledgeBaseParams): useKnowledgeBaseProvided => {
  const notify = useNotification();
  const { t } = useTranslation();

  // we need to first check the privileges before fetching the knowledge base details
  const { data: knowledgeBasePrivileges, loading: loadingPrivileges } = useVirtualContributorKnowledgePrivilegesQuery({
    variables: {
      id: id!,
    },
    skip: !id,
  });

  const privileges = knowledgeBasePrivileges?.virtualContributor?.knowledgeBase?.authorization?.myPrivileges ?? [];
  const hasReadAccess = privileges.includes(AuthorizationPrivilege.Read);

  const { data: knowledgeBaseData, loading: knowledgeBaseLoading } = useVirtualContributorKnowledgeBaseQuery({
    variables: {
      id: id!,
    },
    skip: !id || !hasReadAccess,
  });
  const knowledgeBase = knowledgeBaseData?.virtualContributor?.knowledgeBase;
  const calloutsSetId = knowledgeBase?.calloutsSet?.id ?? '';

  const [updateVC] = useUpdateVirtualContributorMutation({
    refetchQueries: ['VirtualContributorKnowledgeBase'],
  });
  const updateDescription = async ({ description }) => {
    await updateVC({
      variables: {
        virtualContributorData: {
          ID: id!,
          knowledgeBaseData: {
            profile: {
              description: description,
            },
          },
        },
      },
    });
  };

  const [updateBodyOfKnowledge, { loading: ingestLoading }] = useRefreshBodyOfKnowledgeMutation();
  const ingestKnowledge = () => {
    return updateBodyOfKnowledge({
      variables: {
        refreshData: {
          virtualContributorID: id!,
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
    });
  };

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
    loading: knowledgeBaseLoading,
    loadingPrivileges,
    calloutsSetLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
    knowledgeBaseDescription: knowledgeBaseData?.virtualContributor?.knowledgeBase?.profile?.description,
    updateDescription,
    ingestKnowledge,
    ingestLoading,
    hasReadAccess,
  };
};

export default useKnowledgeBase;
