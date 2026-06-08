import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutsSetTagsQuery } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import { FilterResultsSummary } from '@/crd/components/common/FilterResultsSummary';
import { TagFilterPopover } from '@/crd/components/common/TagFilterPopover';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { SearchField } from '@/crd/forms/SearchField';
import { Button } from '@/crd/primitives/button';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useSpace } from '@/domain/space/context/useSpace';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { mapCalloutsToListItems } from '@/main/crdPages/space/dataMappers/calloutDataMapper';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';
import { useCrdSpaceLeads } from '../hooks/useCrdSpaceLeads';
import { SpaceSidebarPortal } from '../layout/SpaceSidebarPortal';
import { SpaceTabActionHeader } from '../layout/SpaceTabActionHeader';

type CrdSpaceCustomTabPageProps = {
  sectionIndex: number;
};

export default function CrdSpaceCustomTabPage({ sectionIndex }: CrdSpaceCustomTabPageProps) {
  const { t } = useTranslation('crd-space');
  const { space, permissions } = useSpace();
  const navigate = useNavigate();
  const sidebarLeads = useCrdSpaceLeads(space.id);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const {
    callouts,
    calloutsSetId,
    classificationTagsets,
    canCreateCallout,
    canReorderCallouts,
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
  // description and tags case-insensitively. The feed and the left-sidebar
  // index both render this filtered set, so they stay in sync.
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

  const indexEntries = mapCalloutsToListItems(visibleCallouts, sectionIndex + 1, t);

  // SPA-navigate to the callout (opens the detail dialog over this tab) rather
  // than letting the native <a> do a full-page load that resets the tab.
  const handleEntryClick = (id: string) => {
    const href = indexEntries.find(entry => entry.id === id)?.href;
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
          onEditClick={permissions.canUpdate ? () => navigate(`${space.about.profile.url}/settings/about`) : undefined}
          knowledgeEntries={indexEntries}
          onKnowledgeEntryClick={handleEntryClick}
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

        {/* Search filters the feed and the sidebar index; tags live behind the
            filter button rather than on the board. */}
        <div className="flex items-center gap-2">
          <SearchField
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder={t('knowledge.searchPlaceholder')}
            ariaLabel={t('knowledge.searchLabel')}
            className="flex-1"
          />
          <TagFilterPopover tags={allTags} selectedTags={tagsFilter} onTagClick={handleToggleTag} />
        </div>

        <FilterResultsSummary searchTerm={searchQuery} tags={tagsFilter} onClear={handleClearFilters} />

        {(trimmedQuery || tagsFilter.length > 0) && visibleCallouts.length === 0 ? (
          <p className="text-body text-muted-foreground">{t('knowledge.noResults')}</p>
        ) : (
          <CalloutListConnector
            callouts={visibleCallouts}
            calloutsSetId={calloutsSetId}
            canReorder={canReorderCallouts}
            loading={loading}
          />
        )}
      </div>

      {canCreateCallout && (
        <StorageConfigContextProvider
          locationType="space"
          spaceId={space.id}
          temporaryLocation={true}
          skip={!createOpen}
        >
          <CalloutFormConnector
            open={createOpen}
            onOpenChange={setCreateOpen}
            calloutsSetId={calloutsSetId}
            activeFlowStateName={flowStateForNewCallouts?.displayName}
            defaultTemplateId={flowStateForNewCallouts?.defaultCalloutTemplate?.id}
          />
        </StorageConfigContextProvider>
      )}
    </>
  );
}
