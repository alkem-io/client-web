import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Menu } from '@mui/icons-material';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import InnovationFlowVisualizerMobile from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowVisualizerMobile';
import { DialogActionButton } from '../components/subspaces/DialogActionButton';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import { gutters } from '@/core/ui/grid/utils';
import { Paper } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';
import PoweredBy from '@/main/ui/poweredBy/PoweredBy';
import { GRID_COLUMNS_MOBILE, useScreenSize } from '@/core/ui/grid/constants';
import SwapColors from '@/core/ui/palette/SwapColors';
import { Drawer } from '@mui/material';
import GridProvider from '@/core/ui/grid/GridProvider';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { MenuList } from '@mui/material';
import SpaceWelcomeBlock, { SpaceWelcomeBlockProps } from '../components/SpaceWelcomeBlock';
import { InnovationFlowStateModel } from '@/domain/collaboration/InnovationFlow/models/InnovationFlowStateModel';

interface SubspaceDrawerMenuProps {
  innovationFlowStates?: InnovationFlowStateModel[];
  selectedInnovationFlowState?: string;
  currentInnovationFlowState?: string;
  createButton?: React.ReactNode;
  onSelectState: (stateName: string) => void;
  about?: SpaceWelcomeBlockProps['spaceAbout'];
  isVideoCallEnabled?: boolean;
  canEdit?: boolean;
}

export const SubspaceDrawerMenu = ({
  innovationFlowStates,
  selectedInnovationFlowState,
  currentInnovationFlowState,
  createButton,
  onSelectState,
  about,
  isVideoCallEnabled = false,
  canEdit = false,
}: SubspaceDrawerMenuProps) => {
  const { isSmallScreen } = useScreenSize();

  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);

  const handleCloseDrawer = () => setIsInfoDrawerOpen(false);
  if (!isSmallScreen) {
    return null;
  }
  const showInnovationFlowStates = innovationFlowStates && selectedInnovationFlowState;
  return (
    <>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1 }} elevation={3} square>
        <Gutters row padding={1} paddingBottom={0} justifyContent="space-between">
          <IconButton onClick={() => setIsInfoDrawerOpen(true)}>
            <Menu />
          </IconButton>

          {showInnovationFlowStates && (
            <InnovationFlowStates
              states={innovationFlowStates}
              currentState={currentInnovationFlowState}
              selectedState={selectedInnovationFlowState}
              onSelectState={state => onSelectState(state.displayName)}
              visualizer={InnovationFlowVisualizerMobile}
              createButton={createButton}
            />
          )}

          <Box width={gutters(2)} />
        </Gutters>
        <PoweredBy compact />
      </Paper>

      <SwapColors>
        <GridProvider columns={GRID_COLUMNS_MOBILE}>
          <Drawer
            open={isInfoDrawerOpen}
            onClose={() => setIsInfoDrawerOpen(false)}
            sx={{ '.MuiDrawer-paper': { width: '60vw' } }}
          >
            <PageContentBlockSeamless>
              {about && <SpaceWelcomeBlock spaceAbout={about} canEdit={canEdit} />}
            </PageContentBlockSeamless>
            <MenuList sx={{ paddingTop: 0, paddingBottom: 1 }}>
              <DialogActionButton onClick={handleCloseDrawer} actionDisplay="menuItem" dialog={SubspaceDialog.About} />
              <DialogActionButton
                onClick={handleCloseDrawer}
                actionDisplay="menuItem"
                dialog={SubspaceDialog.Outline}
              />
              <DialogActionButton onClick={handleCloseDrawer} actionDisplay="menuItem" dialog={SubspaceDialog.Index} />
              <DialogActionButton
                onClick={handleCloseDrawer}
                actionDisplay="menuItem"
                dialog={SubspaceDialog.Subspaces}
              />
              <DialogActionButton
                onClick={handleCloseDrawer}
                actionDisplay="menuItem"
                dialog={SubspaceDialog.Contributors}
              />
              {isVideoCallEnabled && (
                <DialogActionButton
                  onClick={handleCloseDrawer}
                  actionDisplay="menuItem"
                  dialog={SubspaceDialog.VideoCall}
                />
              )}
              <DialogActionButton
                onClick={handleCloseDrawer}
                actionDisplay="menuItem"
                dialog={SubspaceDialog.Activity}
              />
              <DialogActionButton
                onClick={handleCloseDrawer}
                actionDisplay="menuItem"
                dialog={SubspaceDialog.Timeline}
              />
              <DialogActionButton onClick={handleCloseDrawer} actionDisplay="menuItem" dialog={SubspaceDialog.Share} />
              <DialogActionButton
                onClick={handleCloseDrawer}
                actionDisplay="menuItem"
                dialog={SubspaceDialog.ManageFlow}
              />
              <DialogActionButton
                onClick={handleCloseDrawer}
                actionDisplay="menuItem"
                dialog={SubspaceDialog.Settings}
              />
            </MenuList>
          </Drawer>
        </GridProvider>
      </SwapColors>
    </>
  );
};
