import React, { useContext, useEffect, useState, Suspense } from 'react';
import PageContent from '@/core/ui/content/PageContent';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Outlet } from 'react-router-dom';
import { theme } from '@/core/ui/themes/default/Theme';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import PageContentColumnBase from '@/core/ui/content/PageContentColumnBase';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import ApplicationButton from '@/domain/community/applicationButton/ApplicationButton';
import { Box, Button } from '@mui/material';
import { SpaceLevel, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { MENU_STATE_KEY, MenuState, SubspaceInfoColumn } from './SubspaceInfoColumn';
import { InnovationFlowStateContext } from '../routing/SubspaceRoutes';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { useSubSpace } from '../hooks/useSubSpace';
import useInnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.model';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import InnovationFlowChips from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import { DialogActionButton } from '../components/subspaces/DialogActionButton';
import { DialogActions } from '../components/subspaces/DialogActions';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import { gutters } from '@/core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import { useScreenSize } from '@/core/ui/grid/constants';
import { SubspaceDrawerMenu } from './SubspaceDrawerMenu';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import { buildFlowStateClassificationTagsets } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { useVideoCall } from '../hooks/useVideoCall';

const CreateCalloutDialog = lazyWithGlobalErrorHandler(
  () => import('@/domain/collaboration/callout/CalloutDialogs/CreateCalloutDialog')
);

export const SubspacePageLayout = () => {
  const { t } = useTranslation();
  const { permissions } = useSubSpace();
  const { spaceLevel, spaceId, parentSpaceId } = useUrlResolver();
  const { selectedInnovationFlowState, setSelectedInnovationFlowState } = useContext(InnovationFlowStateContext);
  const { data: subspacePageData } = useSubspacePageQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || spaceLevel === SpaceLevel.L0 || !permissions.canRead,
  });

  const subspace = subspacePageData?.lookup.space;
  const about = subspace?.about;
  const collaboration = subspace?.collaboration;
  const calloutsSetId = collaboration?.calloutsSet.id;
  const collaborationId = collaboration?.id;
  const { isVideoCallEnabled } = useVideoCall(subspace?.id);

  const {
    currentInnovationFlowStateDisplayName: currentInnovationFlowState,
    innovationFlowStates,
    canEditInnovationFlow,
  } = useInnovationFlowStates({ collaborationId });
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(false);

  const isCollapsed = localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false;

  const { isSmallScreen } = useScreenSize();
  const hasExtendedApplicationButton = isSmallScreen;

  const createButton = (
    <Button
      variant="outlined"
      startIcon={<AddCircleOutlineIcon />}
      sx={{
        backgroundColor: 'background.paper',
        borderColor: 'divider',
        textWrap: 'nowrap',
      }}
      onClick={() => setIsCalloutCreationDialogOpen(true)}
    >
      {t('common.post')}
    </Button>
  );

  useEffect(() => {
    if (!innovationFlowStates || innovationFlowStates.length === 0) {
      return;
    }
    // Set the current state on page load or the first state if none is selected
    const selectedIndex = innovationFlowStates?.findIndex(state => state.displayName === currentInnovationFlowState);
    if (selectedIndex !== undefined && selectedIndex >= 0) {
      setSelectedInnovationFlowState!(innovationFlowStates[selectedIndex].displayName);
    } else {
      setSelectedInnovationFlowState!(innovationFlowStates[0].displayName);
    }
  }, [innovationFlowStates, currentInnovationFlowState, setSelectedInnovationFlowState]);

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

  const showInnovationFlowStates = Boolean(innovationFlowStates?.length);
  return (
    <>
      <PageContent>
        <SubspaceInfoColumn subspace={subspace} />
        <PageContentColumnBase columns={isCollapsed ? 12 : 9} flexBasis={0} flexGrow={1} flexShrink={1} minWidth={0}>
          <ApplicationButtonContainer spaceId={spaceId} parentSpaceId={parentSpaceId}>
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
                    spaceId={spaceId}
                    spaceLevel={SpaceLevel.L1}
                  />
                </PageContentColumn>
              );
            }}
          </ApplicationButtonContainer>
          {!isSmallScreen && showInnovationFlowStates && (
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                marginTop: gutters(-1),
                marginBottom: gutters(-0.7),
                paddingTop: gutters(1),
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
                  canEditInnovationFlow &&
                  !isSmallScreen && (
                    <DialogActionButton
                      dialog={SubspaceDialog.ManageFlow}
                      buttonVariant="outlined"
                      dialogProps={{ collaborationId: collaborationId }}
                    />
                  )
                }
              />
            </Box>
          )}
          <Outlet />
          <Suspense fallback={null}>
            <CreateCalloutDialog
              open={isCalloutCreationDialogOpen}
              onClose={() => setIsCalloutCreationDialogOpen(false)}
              calloutsSetId={calloutsSetId}
              calloutClassification={buildFlowStateClassificationTagsets(selectedInnovationFlowState)}
            />
          </Suspense>
        </PageContentColumnBase>
      </PageContent>

      <SubspaceDrawerMenu
        innovationFlowStates={innovationFlowStates}
        selectedInnovationFlowState={selectedInnovationFlowState}
        currentInnovationFlowState={currentInnovationFlowState}
        createButton={createButton}
        onSelectState={setSelectedInnovationFlowState!}
        about={about}
        isVideoCallEnabled={isVideoCallEnabled}
      />
      <DialogActions />
      <FloatingActionButtons
        {...(isSmallScreen ? { bottom: gutters(3) } : {})}
        // visible={!isTabsMenuOpen}
        floatingActions={<PlatformHelpButton />}
      />
    </>
  );
};
