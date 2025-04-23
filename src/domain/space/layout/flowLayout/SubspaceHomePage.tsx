import { useState } from 'react';
import SubspaceHomeView from './SubspaceHomeView';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import CreateJourney from '../../components/subspaces/SubspaceCreationDialog/CreateJourney';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';

const SubspaceHomePage = () => {
  const { spaceId, spaceLevel, loading } = useUrlResolver();

  const { permissions } = useSubSpace();

  const [createSpaceState, setCreateSpaceState] = useState<
    | {
        isDialogVisible: true;
        parentSpaceId: string;
      }
    | {
        isDialogVisible: false;
        parentSpaceId?: never;
      }
  >({
    isDialogVisible: false,
  });

  const onCreateJourneyClose = () => {
    setCreateSpaceState({
      isDialogVisible: false,
    });
  };

  const { data: subspacePageData } = useSubspacePageQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || spaceLevel === SpaceLevel.L0 || !permissions.canRead,
  });

  const subspace = subspacePageData?.lookup.space;
  const collaboration = subspace?.collaboration;
  const calloutsSetId = collaboration?.calloutsSet.id;

  return (
    <>
      <SubspaceHomeView calloutsSetId={calloutsSetId} loading={loading} />
      <CreateJourney
        isVisible={createSpaceState.isDialogVisible}
        onClose={onCreateJourneyClose}
        parentSpaceId={createSpaceState.parentSpaceId}
      />
    </>
  );
};

export default SubspaceHomePage;
