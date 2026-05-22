import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutsSetTagsQuery } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useSpace } from '@/domain/space/context/useSpace';
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
  const { space } = useSpace();
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
  // The `CalloutsSetTags` query returns the full tag universe for the calloutsSet — chips stay
  // stable when selected and don't disappear as the callout list filters down.
  const allTags = tagsData?.lookup.calloutsSet?.tags ?? [];

  const handleToggleTag = (tag: string) => {
    setTagsFilter(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  // Free-text search layered on top of the server-side tag filter. Matches
  // case-insensitively against the callout title, description and tags.
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const visibleCallouts = trimmedQuery
    ? callouts.filter(callout => {
        const profile = callout.framing.profile;
        const haystack = [profile.displayName, profile.description ?? '', ...(profile.tagset?.tags ?? [])]
          .join(' ')
          .toLowerCase();
        return haystack.includes(trimmedQuery);
      })
    : callouts;

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

        <div className="relative">
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

        {allTags.length > 0 && (
          <CollapsibleTagList tags={allTags} selectedTags={tagsFilter} onTagClick={handleToggleTag} />
        )}

        {trimmedQuery && visibleCallouts.length === 0 ? (
          <p className="text-body text-muted-foreground">{t('knowledge.noResults')}</p>
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
