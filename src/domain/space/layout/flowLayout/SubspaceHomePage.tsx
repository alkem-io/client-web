import { useState } from 'react';
import SubspaceHomeView from './SubspaceHomeView';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import CreateJourney from '../../components/subspaces/SubspaceCreationDialog/CreateJourney';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import useInnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
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
  const collaborationId = collaboration?.id;

  const innovationFlowProvided = useInnovationFlowStates({ collaborationId });

  return (
    <>
      <SubspaceHomeView
        spaceLevel={subspace?.level}
        collaborationId={collaboration?.id}
        templatesSetId={subspace?.templatesManager?.templatesSet?.id}
        calloutsSetId={calloutsSetId}
        innovationFlowStates={innovationFlowProvided.innovationFlowStates}
        currentInnovationFlowState={innovationFlowProvided.currentInnovationFlowState}
        loading={loading}
      />
      <CreateJourney
        isVisible={createSpaceState.isDialogVisible}
        onClose={onCreateJourneyClose}
        parentSpaceId={createSpaceState.parentSpaceId}
      />
    </>
  );
};

export default SubspaceHomePage;
