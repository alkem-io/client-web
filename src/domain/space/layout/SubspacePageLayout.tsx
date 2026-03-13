import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Box, Button } from '@mui/material';
import { Suspense, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { useSubspacePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { usePageTitle } from '@/core/routing/usePageTitle';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentColumnBase from '@/core/ui/content/PageContentColumnBase';
import { useScreenSize } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import { theme } from '@/core/ui/themes/default/Theme';
import ApplicationButtonContainer from '@/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer';
import type { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.model';
import { buildFlowStateClassificationTagsets } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import useInnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import InnovationFlowChips from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import ApplicationButton from '@/domain/community/applicationButton/ApplicationButton';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import { DialogActionButton } from '../components/subspaces/DialogActionButton';
import { DialogActions } from '../components/subspaces/DialogActions';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import { useSubSpace } from '../hooks/useSubSpace';
import { useVideoCall } from '../hooks/useVideoCall';
import { InnovationFlowStateContext } from '../routing/SubspaceRoutes';
import { SubspaceDrawerMenu } from './SubspaceDrawerMenu';
import { MENU_STATE_KEY, MenuState, SubspaceInfoColumn } from './SubspaceInfoColumn';

const CreateCalloutDialog = lazyWithGlobalErrorHandler(
  () => import('@/domain/collaboration/callout/CalloutDialogs/CreateCalloutDialog')
);

export const SubspacePageLayout = () => {
  const { t } = useTranslation();
  const { permissions, subspace: subspaceContext } = useSubSpace();

  // Set browser tab title to subspace name for L1/L2 subspaces
  usePageTitle(subspaceContext.about.profile.displayName);

  const { spaceLevel, spaceId, parentSpaceId } = useUrlResolver();
  const { selectedInnovationFlowState: selectedFlowStateName, setSelectedInnovationFlowState } =
    useContext(InnovationFlowStateContext);
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
    currentInnovationFlowStateDisplayName,
    selectedInnovationFlowState,
    innovationFlowStates,
    canEditInnovationFlow,
  } = useInnovationFlowStates({ collaborationId, selectedStateName: selectedFlowStateName });
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
    const selectedIndex = innovationFlowStates?.findIndex(
      state => state.displayName === currentInnovationFlowStateDisplayName
    );
    if (selectedIndex !== undefined && selectedIndex >= 0) {
      setSelectedInnovationFlowState?.(innovationFlowStates[selectedIndex].displayName);
    } else {
      setSelectedInnovationFlowState?.(innovationFlowStates[0].displayName);
    }
  }, [innovationFlowStates, currentInnovationFlowStateDisplayName, setSelectedInnovationFlowState]);

  let classificationTagsets: ClassificationTagsetModel[] = [];
  if (selectedFlowStateName) {
    classificationTagsets = [
      {
        name: TagsetReservedName.FlowState,
        tags: [selectedFlowStateName],
      },
    ];
  }

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets: classificationTagsets,
    includeClassification: true,
    skip: !selectedFlowStateName,
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
                currentState={currentInnovationFlowStateDisplayName}
                selectedState={selectedFlowStateName}
                onSelectState={state => setSelectedInnovationFlowState?.(state.displayName)}
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
              calloutClassification={buildFlowStateClassificationTagsets(selectedFlowStateName)}
              defaultTemplateId={selectedInnovationFlowState?.defaultCalloutTemplate?.id ?? null}
            />
          </Suspense>
        </PageContentColumnBase>
      </PageContent>

      <SubspaceDrawerMenu
        innovationFlowStates={innovationFlowStates}
        selectedInnovationFlowState={selectedFlowStateName}
        currentInnovationFlowStateDisplayName={currentInnovationFlowStateDisplayName}
        createButton={createButton}
        onSelectState={setSelectedInnovationFlowState!}
        about={about}
        isVideoCallEnabled={isVideoCallEnabled}
        canEdit={permissions.canUpdate}
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
