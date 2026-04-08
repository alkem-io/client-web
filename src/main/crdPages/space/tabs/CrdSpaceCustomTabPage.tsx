import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { CalloutSidebarList } from '@/crd/components/callout/CalloutSidebarList';
import { CalloutTagCloud } from '@/crd/components/callout/CalloutTagCloud';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';

type CrdSpaceCustomTabPageProps = {
  sectionIndex: number;
};

export default function CrdSpaceCustomTabPage({ sectionIndex }: CrdSpaceCustomTabPageProps) {
  const { space } = useSpace();
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);

  const { callouts, calloutsSetId, canCreateCallout, tabDescription, loading } = useCrdCalloutList({
    tabPosition: sectionIndex,
    tagsFilter: tagsFilter.length > 0 ? tagsFilter : undefined,
  });

  // Build sidebar list from light callout data
  const sidebarItems = callouts.map(callout => ({
    id: callout.id,
    title: callout.framing.profile.displayName,
    type: callout.framing.type === CalloutFramingType.Whiteboard ? ('whiteboard' as const) : ('text' as const),
  }));

  // Build tag cloud — tags come from classification tagsets, not available on light model
  const tagCounts = new Map<string, number>();
  const allTags = Array.from(tagCounts.entries()).map(([name, count]) => ({ name, count }));

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

  // Knowledge entries for sidebar
  const knowledgeEntries = callouts.map(callout => ({
    id: callout.id,
    title: callout.framing.profile.displayName,
    type: 'text' as const,
  }));

  const sidebarContainer = document.getElementById('crd-space-sidebar');

  return (
    <>
      {sidebarContainer &&
        createPortal(
          <SpaceSidebar
            variant="knowledge"
            description={tabDescription || space.about.profile.description || ''}
            knowledgeEntries={knowledgeEntries}
            onKnowledgeEntryClick={handleScrollToCallout}
          >
            {sidebarItems.length > 0 && <CalloutSidebarList items={sidebarItems} onItemClick={handleScrollToCallout} />}
          </SpaceSidebar>,
          sidebarContainer
        )}

      <div className="space-y-6">
        {allTags.length > 0 && (
          <CalloutTagCloud
            tags={allTags}
            selectedTags={tagsFilter}
            resultsCount={callouts.length}
            onSelectTag={handleSelectTag}
            onDeselectTag={handleDeselectTag}
            onClear={handleClear}
          />
        )}

        <CalloutListConnector
          callouts={callouts}
          calloutsSetId={calloutsSetId}
          canCreate={canCreateCallout}
          loading={loading}
        />
      </div>
    </>
  );
}
