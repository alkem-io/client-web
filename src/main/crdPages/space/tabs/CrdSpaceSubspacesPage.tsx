import { Plus } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { SpaceSubspacesList } from '@/crd/components/space/SpaceSubspacesList';
import { TabStateHeader } from '@/crd/components/space/TabStateHeader';
import { Button } from '@/crd/primitives/button';
import { CreateSubspace } from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/CreateSubspace';
import { useSpace } from '@/domain/space/context/useSpace';
import useSubspacesSorted from '@/domain/space/hooks/useSubspacesSorted';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { getInitials } from '../dataMappers/spacePageDataMapper';
import { mapSubspacesToCardDataList } from '../dataMappers/subspaceCardDataMapper';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';

export default function CrdSpaceSubspacesPage() {
  const { t } = useTranslation('crd-space');
  const { spaceId } = useUrlResolver();
  const { space, permissions } = useSpace();
  const {
    callouts,
    calloutsSetId,
    canCreateCallout,
    tabDescription,
    loading: calloutsLoading,
  } = useCrdCalloutList({
    tabPosition: 2,
  });

  const { data: subspacesData } = useSpaceSubspaceCardsQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const rawSubspaces = subspacesData?.lookup.space?.subspaces;
  const sortMode = subspacesData?.lookup.space?.settings.sortMode;
  const sortedSubspaces = useSubspacesSorted(rawSubspaces, sortMode);
  const subspaces = mapSubspacesToCardDataList(sortedSubspaces, sortMode);

  const sidebarSubspaces = subspaces.map(s => ({
    name: s.name,
    initials: getInitials(s.name),
    href: s.href,
  }));

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createCalloutOpen, setCreateCalloutOpen] = useState(false);
  const canCreate = permissions.canCreateSubspaces;
  const handleCreateClick = canCreate ? () => setIsCreateDialogOpen(true) : undefined;

  const sidebarContainer = document.getElementById('crd-space-sidebar');

  return (
    <>
      {sidebarContainer &&
        createPortal(
          <SpaceSidebar
            variant="subspaces"
            description={tabDescription || space.about.profile.description || ''}
            subspaces={sidebarSubspaces}
          />,
          sidebarContainer
        )}

      <div className="space-y-8">
        <TabStateHeader
          description={tabDescription}
          action={
            canCreate &&
            handleCreateClick && (
              <Button size="sm" className="gap-2" onClick={handleCreateClick}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                {t('subspaces.createSubspace')}
              </Button>
            )
          }
        />

        <SpaceSubspacesList subspaces={subspaces} />

        <CalloutListConnector
          callouts={callouts}
          calloutsSetId={calloutsSetId}
          canCreate={canCreateCallout}
          onCreateClick={() => setCreateCalloutOpen(true)}
          loading={calloutsLoading}
        />
      </div>

      {canCreateCallout && (
        <CalloutFormConnector
          open={createCalloutOpen}
          onOpenChange={setCreateCalloutOpen}
          calloutsSetId={calloutsSetId}
        />
      )}

      {canCreate && (
        <CreateSubspace
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          parentSpaceId={spaceId}
        />
      )}
    </>
  );
}
