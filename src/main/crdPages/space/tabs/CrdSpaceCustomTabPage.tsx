import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutsSetTagsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { CalloutListView } from '@/crd/components/callout/CalloutListView';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { FilterResultsSummary } from '@/crd/components/common/FilterResultsSummary';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useSpace } from '@/domain/space/context/useSpace';
import { buildSpaceSectionUrl } from '@/main/routing/urlBuilders';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';
import { useCrdSpaceLeads } from '../hooks/useCrdSpaceLeads';
import { SpaceSidebarPortal } from '../layout/SpaceSidebarPortal';
import { SpaceTabActionHeader } from '../layout/SpaceTabActionHeader';

type CrdSpaceCustomTabPageProps = {
  sectionIndex: number;
};

type KnowledgeViewMode = 'grid' | 'list';

/** Persists the grid/list preference across visits and Knowledge Base tabs. */
const KNOWLEDGE_VIEW_STORAGE_KEY = 'alkemio-knowledge-view';

export default function CrdSpaceCustomTabPage({ sectionIndex }: CrdSpaceCustomTabPageProps) {
  const { t } = useTranslation('crd-space');
  const { space } = useSpace();
  const navigate = useNavigate();
  const sidebarLeads = useCrdSpaceLeads(space.id);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<KnowledgeViewMode>(() =>
    localStorage.getItem(KNOWLEDGE_VIEW_STORAGE_KEY) === 'list' ? 'list' : 'grid'
  );
  const [createOpen, setCreateOpen] = useState(false);

  const handleViewModeChange = (mode: KnowledgeViewMode) => {
    setViewMode(mode);
    localStorage.setItem(KNOWLEDGE_VIEW_STORAGE_KEY, mode);
  };

  const {
    callouts,
    calloutsSetId,
    classificationTagsets,
    canCreateCallout,
    tabDescription,
    flowStateForNewCallouts,
    loading,
  } = useCrdCalloutList({ tabPosition: sectionIndex });

  // Fetch tags via the same GraphQL query the MUI version uses
  const { data: tagsData } = useCalloutsSetTagsQuery({
    variables: {
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      calloutsSetId: calloutsSetId!,
      classificationTagsets: classificationTagsetModelToTagsetArgs(classificationTagsets),
    },
    skip: !calloutsSetId,
  });
  // The `CalloutsSetTags` query returns the full tag universe for the calloutsSet — chips stay
  // stable when selected and don't disappear as the callout list filters down.
  const allTags = tagsData?.lookup.calloutsSet?.tags ?? [];

  const handleToggleTag = (tag: string) => {
    setTagsFilter(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  // Client-side filtering — search + tags, mirroring the Subspaces tab. Tags
  // use AND (every selected tag must be present); search matches the title,
  // description and tags case-insensitively.
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const visibleCallouts = callouts.filter(callout => {
    const profile = callout.framing.profile;
    const calloutTags = profile.tagset?.tags ?? [];
    if (!tagsFilter.every(tag => calloutTags.includes(tag))) {
      return false;
    }
    if (!trimmedQuery) {
      return true;
    }
    const haystack = [profile.displayName, profile.description ?? '', ...calloutTags].join(' ').toLowerCase();
    return haystack.includes(trimmedQuery);
  });

  // Bracketed response summary for the list view, e.g. "2 memos". Built from
  // the callout's contribution type + activity count; callouts that don't
  // collect contributions get no summary.
  const formatResponseMeta = (callout: (typeof callouts)[number]): string | undefined => {
    const count = callout.activity ?? 0;
    if (count <= 0) return undefined;
    switch (callout.settings?.contribution?.allowedTypes?.[0]) {
      case CalloutContributionType.Post:
        return t('knowledge.count.post', { count });
      case CalloutContributionType.Whiteboard:
        return t('knowledge.count.whiteboard', { count });
      case CalloutContributionType.Memo:
        return t('knowledge.count.memo', { count });
      case CalloutContributionType.Link:
        return t('knowledge.count.link', { count });
      case CalloutContributionType.CollaboraDocument:
        return t('knowledge.count.document', { count });
      default:
        return undefined;
    }
  };

  const listItems = visibleCallouts.map(callout => {
    const url = callout.framing.profile.url;
    return {
      id: callout.id,
      title: callout.framing.profile.displayName,
      type: callout.framing.type === CalloutFramingType.Whiteboard ? ('whiteboard' as const) : ('text' as const),
      // Carry the active tab (`?tab=N`) on the callout URL so the background
      // space page stays on the Knowledge Base tab when the dialog opens.
      href: url ? buildSpaceSectionUrl(url, sectionIndex + 1) : undefined,
      meta: formatResponseMeta(callout),
    };
  });

  // SPA-navigate to the callout (opens the detail dialog over this tab) rather
  // than letting the native <a> do a full-page load that resets the tab.
  const handleListItemClick = (id: string) => {
    const href = listItems.find(item => item.id === id)?.href;
    if (href) {
      navigate(href);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTagsFilter([]);
  };

  return (
    <>
      <SpaceSidebarPortal>
        <SpaceSidebar
          variant="knowledge"
          description={space.about.profile.description || ''}
          leads={sidebarLeads}
          onEditClick={() => navigate(`${space.about.profile.url}/settings/about`)}
        />
      </SpaceSidebarPortal>

      <div className="space-y-6">
        <SpaceTabActionHeader
          description={tabDescription}
          action={
            canCreateCallout && (
              <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                {t('feed.addPost')}
              </Button>
            )
          }
        />

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder={t('knowledge.searchPlaceholder')}
              aria-label={t('knowledge.searchLabel')}
              className="pl-9"
            />
          </div>

          <div className="flex h-9 shrink-0 items-center gap-0.5 rounded-md border border-border px-0.5">
            <button
              type="button"
              aria-label={t('knowledge.viewGrid')}
              aria-pressed={viewMode === 'grid'}
              onClick={() => handleViewModeChange('grid')}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={t('knowledge.viewList')}
              aria-pressed={viewMode === 'list'}
              onClick={() => handleViewModeChange('list')}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {allTags.length > 0 && (
          <CollapsibleTagList tags={allTags} selectedTags={tagsFilter} onTagClick={handleToggleTag} />
        )}

        <FilterResultsSummary searchTerm={searchQuery} tags={tagsFilter} onClear={handleClearFilters} />

        {(trimmedQuery || tagsFilter.length > 0) && visibleCallouts.length === 0 ? (
          <p className="text-body text-muted-foreground">{t('knowledge.noResults')}</p>
        ) : viewMode === 'list' ? (
          <CalloutListView items={listItems} onItemClick={handleListItemClick} />
        ) : (
          <CalloutListConnector callouts={visibleCallouts} calloutsSetId={calloutsSetId} loading={loading} />
        )}
      </div>

      {canCreateCallout && (
        <CalloutFormConnector
          open={createOpen}
          onOpenChange={setCreateOpen}
          calloutsSetId={calloutsSetId}
          activeFlowStateName={flowStateForNewCallouts?.displayName}
          defaultTemplateId={flowStateForNewCallouts?.defaultCalloutTemplate?.id}
        />
      )}
    </>
  );
}
