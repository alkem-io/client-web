import { useContext, useState } from 'react';
import { SpaceLevel, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { SubspaceDialog } from '../../components/subspaces/SubspaceDialog';
import SubspacesListDialog from '../../components/SubspacesListDialog';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { useScreenSize } from '@/core/ui/grid/constants';
import { InnovationFlowStateContext } from '../../routing/SubspaceRoutes';
import { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.model';
import CreateSubspace from '../../components/subspaces/SubspaceCreationDialog/CreateSubspace';

const SubspaceHomePage = ({ dialog }: { dialog?: SubspaceDialog }) => {
  const { isSmallScreen } = useScreenSize();
  const { selectedInnovationFlowState } = useContext(InnovationFlowStateContext);
  const { spaceId, spaceLevel, loading } = useUrlResolver();

  const {
    permissions,
    subspace: {
      about: {
        profile: { url },
      },
    },
  } = useSubSpace();
  const handleClose = useBackToStaticPath(url ?? '');

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

  const onCreateSubspaceClose = () => {
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

  let classificationTagsets: ClassificationTagsetModel[] = [];
  if (selectedInnovationFlowState) {
    classificationTagsets = [
      {
        name: TagsetReservedName.FlowState,
        tags: [selectedInnovationFlowState],
      },
    ];
  }

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets: classificationTagsets,
    includeClassification: true,
    skip: !selectedInnovationFlowState,
  });

  return (
    <>
      <CalloutsGroupView
        calloutsSetId={calloutsSetId}
        callouts={calloutsSetProvided.callouts}
        canCreateCallout={calloutsSetProvided.canCreateCallout && isSmallScreen}
        loading={loading}
        onSortOrderUpdate={calloutsSetProvided.onCalloutsSortOrderUpdate}
        onCalloutUpdate={calloutsSetProvided.refetchCallout}
        createButtonPlace="top"
        createInFlowState={selectedInnovationFlowState}
      />

      <CreateSubspace
        isVisible={createSpaceState.isDialogVisible}
        onClose={onCreateSubspaceClose}
        parentSpaceId={createSpaceState.parentSpaceId}
      />
      <SubspacesListDialog open={dialog === SubspaceDialog.Subspaces} onClose={handleClose} />
    </>
  );
};

export default SubspaceHomePage;
