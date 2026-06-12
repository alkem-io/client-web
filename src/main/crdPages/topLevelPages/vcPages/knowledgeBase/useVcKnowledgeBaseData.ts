import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  useVirtualContributorKnowledgeBaseLastUpdatedQuery,
  useVirtualContributorProfileWithModelCardQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import type { CalloutModelLightExtended } from '@/domain/collaboration/callout/models/CalloutModelLight';
import useKnowledgeBase from '@/domain/community/virtualContributor/knowledgeBase/useKnowledgeBase';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { mapVcKnowledgeBaseToViewProps } from './vcKnowledgeBaseMapper';

/**
 * Integration hook for the CRD Knowledge Base page. Reuses the shared
 * `useKnowledgeBase` (callouts + refresh + description + access) and adds VC
 * identity + last-updated formatting, then maps to the CRD view props. The
 * callouts list is returned raw for the page to feed into the CRD callouts feed.
 */
export const useVcKnowledgeBaseData = () => {
  const { t, i18n } = useTranslation('crd-profilePages');
  const notify = useNotification();
  const { vcId } = useUrlResolver();

  const kb = useKnowledgeBase({ id: vcId });

  const onSaveDescription = async (next: string): Promise<boolean> => {
    try {
      await kb.updateDescription({ description: next });
      return true;
    } catch {
      notify(t('knowledgeBase.description.saveError'), 'error');
      return false;
    }
  };

  const { data: identityData } = useVirtualContributorProfileWithModelCardQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });
  const profile = identityData?.lookup.virtualContributor?.profile;

  const { data: lastUpdatedData } = useVirtualContributorKnowledgeBaseLastUpdatedQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId || !kb.hasReadAccess,
  });
  const lastUpdated = lastUpdatedData?.virtualContributor?.aiPersona?.bodyOfKnowledgeLastUpdated;
  const lastUpdatedValue = lastUpdated
    ? format(new Date(lastUpdated), 'PPp', { locale: resolveDateFnsLocale(i18n.language) })
    : undefined;

  const viewProps = mapVcKnowledgeBaseToViewProps({
    loading: kb.loadingPrivileges || kb.loading,
    noAccess: !kb.hasReadAccess && !kb.loadingPrivileges,
    vcId,
    displayName: profile?.displayName,
    avatarUrl: profile?.avatar?.uri,
    description: kb.knowledgeBaseDescription,
    canRefresh: kb.canCreateCallout,
    lastUpdatedValue,
    onRefresh: () => {
      void kb.ingestKnowledge();
    },
    refreshing: kb.ingestLoading,
    calloutsCount: kb.callouts?.length ?? 0,
  });

  return {
    vcId,
    displayName: profile?.displayName,
    profileUrl: profile?.url,
    viewProps,
    canEditDescription: kb.canCreateCallout,
    onSaveDescription,
    callouts: (kb.callouts ?? []) as CalloutModelLightExtended[],
    calloutsSetId: kb.calloutsSetId,
    canCreateCallout: kb.canCreateCallout,
    canReorder: kb.canCreateCallout,
    calloutsLoading: kb.calloutsSetLoading,
  };
};
