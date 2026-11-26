import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { FlowStateSearchResults } from '@/crd/components/search/FlowStateSearchResults';
import { SubspaceFlowTabs } from '@/crd/components/space/SubspaceFlowTabs';
import { TabStateHeader } from '@/crd/components/space/TabStateHeader';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import { CalloutListConnector } from '../../space/callout/CalloutListConnector';
import { LazyCalloutItem } from '../../space/callout/LazyCalloutItem';
import { useSpaceFeed } from '../../space/hooks/useCrdCalloutList';
import { useCrdSubspaceFlow } from '../hooks/useCrdSubspaceFlow';
import type { SubspaceOutletContext } from '../layout/CrdSubspacePageLayout';

export default function CrdSubspaceCalloutsPage() {
  const { t } = useTranslation('crd-space');
  const { data, mobileMenu, headerActionIcons, search } = useOutletContext<SubspaceOutletContext>();
  const { phases, currentPhaseId, calloutsSetId, canEditFlow, canUpdate, subspaceId, subspaceUrl } = data;
  const { activePhaseId, setActivePhaseId } = useCrdSubspaceFlow(phases, currentPhaseId);
  const isSmallScreen = useMediaQuery('(max-width: 639px)');

  const activePhase = phases.find(p => p.id === activePhaseId);

  // The active phase's feed, which the layout's page request loads (021 FR-005).
  const feed = useSpaceFeed(activePhase && subspaceId, activePhase?.id);
  // Add Post moved to the sidebar — the layout owns the button and its dialog
  // (gated on the calloutsSet's CreateCallout privilege, same as the L0 tabs).

  const editFlowHref = subspaceUrl ? buildSettingsTabUrl(subspaceUrl, 'layout') : undefined;

  const flowTabs = (
    <SubspaceFlowTabs
      // Stage visibility is not served yet (021 S01): configured phases show as unavailable, never all of them.
      phases={[]}
      emptyMessage={phases.length > 0 ? t('tabs.unavailable') : undefined}
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
      {activePhase &&
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
        ) : feed.notServed ? (
          // The space tree is not served yet: the feed says so in place.
          <p className="text-body text-muted-foreground py-6 text-center">{t('tabs.unavailable')}</p>
        ) : (
          <CalloutListConnector
            callouts={feed.posts}
            calloutsSetId={calloutsSetId}
            canCreate={false}
            canReorder={canUpdate}
            loading={feed.loading}
          />
        ))}

      {/* Clearance for the fixed h-14 mobile bottom bar (always rendered below sm). */}
      <div className="h-20 sm:hidden" aria-hidden="true" />
    </div>
  );
}
