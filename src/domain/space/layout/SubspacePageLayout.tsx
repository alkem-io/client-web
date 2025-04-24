import PageContent from '@/core/ui/content/PageContent';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Outlet } from 'react-router-dom';
import { theme } from '@/core/ui/themes/default/Theme';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import PageContentColumnBase from '@/core/ui/content/PageContentColumnBase';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import ApplicationButton from '@/domain/community/applicationButton/ApplicationButton';
import { Box, Button, IconButton, Theme, useMediaQuery } from '@mui/material';
import { Menu } from '@mui/icons-material';
import { SpaceLevel, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { MENU_STATE_KEY, MenuState, SubspaceInfoColumn } from './SubspaceInfoColumn';
import { InnovationFlowStateContext } from '../routing/SubspaceRoutes';
import { useContext, useEffect } from 'react';
import { useCalloutCreationWithPreviewImages } from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { useSubSpace } from '../hooks/useSubSpace';
import useInnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/ClassificationTagset.model';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import InnovationFlowVisualizerMobile from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowVisualizerMobile';
import InnovationFlowChips from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import { DialogAction } from '../components/subspaces/DialogAction';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import { gutters } from '@/core/ui/grid/utils';
import { Paper } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';
import PoweredBy from '@/main/ui/poweredBy/PoweredBy';
import { useTranslation } from 'react-i18next';
import CalloutCreationDialog from '@/domain/collaboration/callout/creationDialog/CalloutCreationDialog';

export const SubspacePageLayout = () => {
  const { t } = useTranslation();
  const { permissions } = useSubSpace();
  const { spaceLevel, spaceId, parentSpaceId, loading } = useUrlResolver();
  const { selectedInnovationFlowState, setSelectedInnovationFlowState } = useContext(InnovationFlowStateContext);
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

  const { isCalloutCreationDialogOpen, handleCreateCalloutOpened, handleCreateCalloutClosed, handleCreateCallout } =
    useCalloutCreationWithPreviewImages({ calloutsSetId });

  const isCollapsed = localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false;

  const hasExtendedApplicationButton = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const createButton = (
    <Button
      variant="outlined"
      startIcon={<AddCircleOutlineIcon />}
      sx={{
        backgroundColor: 'background.paper',
        borderColor: 'divider',
        textWrap: 'nowrap',
      }}
      onClick={handleCreateCalloutOpened}
    >
      {t('common.collaborationTool')}
    </Button>
  );

  const { currentInnovationFlowState, innovationFlowStates } = useInnovationFlowStates({ collaborationId });
  const doesSelectedInnovationFlowStateExist = innovationFlowStates?.some(
    state => state.displayName === selectedInnovationFlowState
  );

  // on e.g. innovation flow template change #6319
  useEffect(() => {
    if (!doesSelectedInnovationFlowStateExist) {
      setSelectedInnovationFlowState!(currentInnovationFlowState!);
    }
  }, [doesSelectedInnovationFlowStateExist]);

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

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const showInnovationFlowStates = innovationFlowStates && currentInnovationFlowState && selectedInnovationFlowState;
  return (
    <>
      <PageContent>
        <SubspaceInfoColumn />

        <PageContentColumnBase columns={isCollapsed ? 12 : 9} flexBasis={0} flexGrow={1} flexShrink={1} minWidth={0}>
          <ApplicationButtonContainer journeyId={spaceId} parentSpaceId={parentSpaceId}>
            {(applicationButtonProps, loading) => {
              if (loading || applicationButtonProps.isMember) {
                return null;
              }
              return (
                <PageContentColumn columns={9}>
                  <ApplicationButton
                    {...applicationButtonProps}
                    loading={loading}
                    component={FullWidthButton}
                    extended={hasExtendedApplicationButton}
                    journeyId={spaceId}
                    spaceLevel={SpaceLevel.L1}
                  />
                </PageContentColumn>
              );
            }}
          </ApplicationButtonContainer>
          {!isMobile && showInnovationFlowStates && (
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                marginTop: gutters(-1),
                paddingY: gutters(1),
                background: theme.palette.background.default,
                width: '100%',
                zIndex: 1,
                boxShadow: theme => `0 6px 5px 2px ${theme.palette.background.default}`,
              }}
            >
              <InnovationFlowStates
                states={innovationFlowStates}
                currentState={currentInnovationFlowState}
                selectedState={selectedInnovationFlowState}
                onSelectState={state => setSelectedInnovationFlowState!(state.displayName)}
                visualizer={InnovationFlowChips}
                createButton={calloutsSetProvided?.canCreateCallout && createButton}
                settingsButton={
                  <DialogAction
                    dialog={SubspaceDialog.ManageFlow}
                    buttonVariant="outlined"
                    dialogProps={{ collaborationId: collaborationId }}
                  />
                }
              />
            </Box>
          )}

          <Outlet />
          <CalloutCreationDialog
            open={isCalloutCreationDialogOpen}
            onClose={handleCreateCalloutClosed}
            onCreateCallout={handleCreateCallout}
            loading={loading}
            flowState={selectedInnovationFlowState}
          />
        </PageContentColumnBase>
      </PageContent>
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1 }} elevation={3} square>
          <Gutters row padding={1} paddingBottom={0} justifyContent="space-between">
            <IconButton onClick={() => {}}>
              <Menu />
            </IconButton>

            {isMobile && showInnovationFlowStates && (
              <InnovationFlowStates
                states={innovationFlowStates}
                currentState={currentInnovationFlowState}
                selectedState={selectedInnovationFlowState}
                onSelectState={state => setSelectedInnovationFlowState!(state.displayName)}
                visualizer={InnovationFlowVisualizerMobile}
                createButton={calloutsSetProvided?.canCreateCallout && createButton}
              />
            )}

            <Box width={gutters(2)} />
          </Gutters>
          <PoweredBy compact />
        </Paper>
      )}
    </>
  );
};
