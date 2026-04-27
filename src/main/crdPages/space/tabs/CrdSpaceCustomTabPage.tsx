import { Plus } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useCalloutsSetTagsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { CalloutTagCloud } from '@/crd/components/callout/CalloutTagCloud';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { TabStateHeader } from '@/crd/components/space/TabStateHeader';
import { Button } from '@/crd/primitives/button';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';

type CrdSpaceCustomTabPageProps = {
  sectionIndex: number;
};

export default function CrdSpaceCustomTabPage({ sectionIndex }: CrdSpaceCustomTabPageProps) {
  const { t } = useTranslation('crd-space');
  const { space } = useSpace();
  const navigate = useNavigate();
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const { callouts, calloutsSetId, classificationTagsets, canCreateCallout, tabDescription, loading } =
    useCrdCalloutList({
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
  const allTags = (tagsData?.lookup.calloutsSet?.tags ?? []).map(tag => ({ name: tag, count: 0 }));

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

  const sidebarContainer = document.getElementById('crd-space-sidebar');

  return (
    <>
      {sidebarContainer &&
        createPortal(
          <SpaceSidebar
            variant="knowledge"
            description={tabDescription || space.about.profile.description || ''}
            onAboutClick={() => navigate(`${space.about.profile.url}/${EntityPageSection.About}`)}
            knowledgeEntries={sidebarItems}
            onKnowledgeEntryClick={handleScrollToCallout}
          />,
          sidebarContainer
        )}

      <div className="space-y-6">
        <TabStateHeader
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
        <CalloutFormConnector open={createOpen} onOpenChange={setCreateOpen} calloutsSetId={calloutsSetId} />
      )}
    </>
  );
}
