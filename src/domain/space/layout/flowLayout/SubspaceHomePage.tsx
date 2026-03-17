import { useContext, useState } from 'react';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import { useScreenSize } from '@/core/ui/grid/constants';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import type { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.model';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import CreateSubspace from '../../components/CreateSpace/SubspaceCreationDialog/CreateSubspace';
import SubspacesListDialog from '../../components/SubspacesListDialog';
import { SubspaceDialog } from '../../components/subspaces/SubspaceDialog';
import { InnovationFlowStateContext } from '../../routing/SubspaceRoutes';

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
        open={createSpaceState.isDialogVisible}
        onClose={onCreateSubspaceClose}
        parentSpaceId={createSpaceState.parentSpaceId}
      />
      <SubspacesListDialog open={dialog === SubspaceDialog.Subspaces} onClose={handleClose} />
    </>
  );
};

export default SubspaceHomePage;
