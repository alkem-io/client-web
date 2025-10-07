import { useTranslation } from 'react-i18next';
import {
  AuthorizationPrivilege,
  CalloutsOnCalloutsSetUsingClassificationQueryVariables,
} from '@/core/apollo/generated/graphql-schema';
import useCalloutsSet, { OrderUpdate } from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import {
  useRefreshBodyOfKnowledgeMutation,
  useUpdateVirtualContributorMutation,
  useVirtualContributorKnowledgeBaseQuery,
  useVirtualContributorKnowledgePrivilegesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { CalloutModelLightExtended } from '@/domain/collaboration/callout/models/CalloutModelLight';

interface useKnowledgeBaseParams {
  id: string | undefined;
}

interface useKnowledgeBaseProvided {
  callouts: CalloutModelLightExtended[] | undefined;
  calloutsSetId: string;
  canCreateCallout: boolean;
  loading: boolean;
  calloutsSetLoading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsOnCalloutsSetUsingClassificationQueryVariables>) => void;
  refetchCallout: (calloutId: string) => Promise<unknown> | void;
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
        notify(t('pages.virtualContributorProfile.bokIngestStarted'), 'success');
      },
    });
  };

  const {
    callouts,
    canCreateCallout,
    loading: calloutsSetLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets: [],
  });

  return {
    callouts,
    calloutsSetId,
    canCreateCallout,
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
