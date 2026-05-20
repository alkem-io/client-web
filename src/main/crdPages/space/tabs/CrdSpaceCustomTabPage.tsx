import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutsSetTagsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { CalloutTagCloud } from '@/crd/components/callout/CalloutTagCloud';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { Button } from '@/crd/primitives/button';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';
import { useCrdSpaceLeads } from '../hooks/useCrdSpaceLeads';
import { SpaceSidebarPortal } from '../layout/SpaceSidebarPortal';
import { SpaceTabActionHeader } from '../layout/SpaceTabActionHeader';
import { countTagOccurrences } from './calloutTagCount';

type CrdSpaceCustomTabPageProps = {
  sectionIndex: number;
};

export default function CrdSpaceCustomTabPage({ sectionIndex }: CrdSpaceCustomTabPageProps) {
  const { t } = useTranslation('crd-space');
  const { space } = useSpace();
  const navigate = useNavigate();
  const sidebarLeads = useCrdSpaceLeads(space.id);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const {
    callouts,
    calloutsSetId,
    classificationTagsets,
    canCreateCallout,
    tabDescription,
    flowStateForNewCallouts,
    loading,
  } = useCrdCalloutList({
    tabPosition: sectionIndex,
    tagsFilter: tagsFilter.length > 0 ? tagsFilter : undefined,
  });

  // Fetch tags via the same GraphQL query the MUI version uses
  const { data: tagsData } = useCalloutsSetTagsQuery({
    variables: {
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      calloutsSetId: calloutsSetId!,
      classificationTagsets: classificationTagsetModelToTagsetArgs(classificationTagsets),
    },
    skip: !calloutsSetId,
  });
  // The `CalloutsSetTags` query returns just `tags: string[]` (the universe of tags across the
  // calloutsSet). Counts are tallied client-side from the currently visible (filtered) `callouts`
  // array — so each chip shows "if I add this tag to the current filter, this many callouts remain".
  // Tags in the universe that aren't on any visible callout legitimately get 0.
  const tagCounts = countTagOccurrences(callouts);
  const allTags = (tagsData?.lookup.calloutsSet?.tags ?? []).map(name => ({
    name,
    count: tagCounts[name] ?? 0,
  }));

  // Build sidebar list from light callout data (also used as knowledge entries)
  const sidebarItems = callouts.map(callout => {
    const profile = callout.framing.profile;
    return {
      id: callout.id,
      title: profile.displayName,
      type: callout.framing.type === CalloutFramingType.Whiteboard ? ('collection' as const) : ('text' as const),
      description: profile.description,
      tags: profile.tagset?.tags,
    };
  });

  const handleSelectTag = (tag: string) => {
    setTagsFilter(prev => [...prev, tag]);
  };

  const handleDeselectTag = (tag: string) => {
    setTagsFilter(prev => prev.filter(t => t !== tag));
  };

  const handleClear = () => {
    setTagsFilter([]);
  };

  const handleScrollToCallout = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <SpaceSidebarPortal>
        <SpaceSidebar
          variant="knowledge"
          description={space.about.profile.description || ''}
          leads={sidebarLeads}
          onEditClick={() => navigate(`${space.about.profile.url}/settings/about`)}
          knowledgeEntries={sidebarItems}
          onKnowledgeEntryClick={handleScrollToCallout}
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

        {(allTags.length > 0 || tagsFilter.length > 0) && (
          <CalloutTagCloud
            tags={allTags}
            selectedTags={tagsFilter}
            resultsCount={callouts.length}
            onSelectTag={handleSelectTag}
            onDeselectTag={handleDeselectTag}
            onClear={handleClear}
          />
        )}

        <CalloutListConnector callouts={callouts} calloutsSetId={calloutsSetId} loading={loading} />
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
