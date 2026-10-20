import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { AuthorizationPrivilege, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { FlowStateSearchResults } from '@/crd/components/search/FlowStateSearchResults';
import { SubspaceFlowTabs } from '@/crd/components/space/SubspaceFlowTabs';
import { TabStateHeader } from '@/crd/components/space/TabStateHeader';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import { CalloutListConnector } from '../../space/callout/CalloutListConnector';
import { LazyCalloutItem } from '../../space/callout/LazyCalloutItem';
import { useCrdSubspaceFlow } from '../hooks/useCrdSubspaceFlow';
import type { SubspaceOutletContext } from '../layout/CrdSubspacePageLayout';

export default function CrdSubspaceCalloutsPage() {
  const { t } = useTranslation('crd-space');
  const { data, mobileMenu, headerActionIcons, search } = useOutletContext<SubspaceOutletContext>();
  const { phases, currentPhaseId, calloutsSetId, canEditFlow, subspaceUrl } = data;
  const { activePhaseId, setActivePhaseId } = useCrdSubspaceFlow(phases, currentPhaseId);
  const isSmallScreen = useMediaQuery('(max-width: 639px)');

  const activePhase = phases.find(p => p.id === activePhaseId);
  const classificationTagsets = activePhase ? [{ name: TagsetReservedName.FlowState, tags: [activePhase.label] }] : [];

  const {
    callouts,
    loading: calloutsLoading,
    calloutsSetAuthorization,
  } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
    skip: !calloutsSetId || phases.length === 0,
  });
  // Reordering callouts requires Update on the calloutsSet (not the callout).
  const canReorderCallouts = calloutsSetAuthorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
  // Add Post moved to the sidebar — the layout owns the button and its dialog
  // (gated on the calloutsSet's CreateCallout privilege, same as the L0 tabs).

  const editFlowHref = subspaceUrl ? buildSettingsTabUrl(subspaceUrl, 'layout') : undefined;

  const flowTabs = (
    <SubspaceFlowTabs
      phases={phases}
      activePhaseId={activePhaseId}
      onPhaseChange={setActivePhaseId}
      canEditFlow={canEditFlow}
      editFlowHref={editFlowHref}
      action={headerActionIcons}
      mobileMenuOpen={mobileMenu.open}
      onMobileMenuOpenChange={mobileMenu.available ? mobileMenu.onOpenChange : undefined}
      mobileMenuContent={mobileMenu.content}
    />
  );

  return (
    <div className="space-y-6">
      {isSmallScreen ? (
        flowTabs
      ) : (
        <div className="sticky top-16 z-30 pt-4 pb-3 bg-background/95 backdrop-blur-sm">{flowTabs}</div>
      )}

      {/* Active phase description — collapsible (2 lines, 3 on small screens)
          with a "See full description" toggle, identical to the L0 tab
          flow-state description. */}
      {activePhase?.description && <TabStateHeader description={activePhase.description} />}

      {/* While the sidebar search is active, its matches (active phase only) replace the feed. */}
      {phases.length > 0 &&
        (search?.isSearching ? (
          <FlowStateSearchResults
            status={search.status}
            appending={search.appending}
            hasMore={search.hasMore}
            sentinelRef={search.sentinelRef}
            onRetry={search.retry}
            labels={{
              emptyTitle: t('knowledge.search.emptyTitle'),
              emptyDescription: t('knowledge.search.emptyDescription'),
              errorTitle: t('knowledge.search.errorTitle'),
              errorDescription: t('knowledge.search.errorDescription'),
              retry: t('knowledge.search.retry'),
              loadingLabel: t('knowledge.search.loadingLabel'),
              appendingLabel: t('knowledge.search.appendingLabel'),
            }}
          >
            {search.calloutIds.map(id => (
              <LazyCalloutItem
                key={id}
                calloutId={id}
                calloutsSetId={calloutsSetId}
                canReorder={false}
                forceDescriptionCollapsed={true}
              />
            ))}
          </FlowStateSearchResults>
        ) : (
          <CalloutListConnector
            callouts={callouts ?? []}
            calloutsSetId={calloutsSetId}
            canCreate={false}
            canReorder={canReorderCallouts}
            loading={calloutsLoading}
          />
        ))}

      {/* Clearance for the fixed h-14 mobile bottom bar (always rendered below sm). */}
      <div className="h-20 sm:hidden" aria-hidden="true" />
    </div>
  );
}
