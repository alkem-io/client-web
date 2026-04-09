import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { SpaceSubspacesList } from '@/crd/components/space/SpaceSubspacesList';
import { CreateSubspace } from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/CreateSubspace';
import { useSpace } from '@/domain/space/context/useSpace';
import useSubspacesSorted from '@/domain/space/hooks/useSubspacesSorted';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { getInitials } from '../dataMappers/spacePageDataMapper';
import { mapSubspacesToCardDataList } from '../dataMappers/subspaceCardDataMapper';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';

export default function CrdSpaceSubspacesPage() {
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
    color: 'var(--chart-1)',
    href: s.href,
  }));

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
        <SpaceSubspacesList subspaces={subspaces} canCreate={canCreate} onCreateClick={handleCreateClick} />

        <CalloutListConnector
          callouts={callouts}
          calloutsSetId={calloutsSetId}
          canCreate={canCreateCallout}
          loading={calloutsLoading}
        />
      </div>

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
