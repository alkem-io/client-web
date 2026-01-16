import { Box, Button, CircularProgress, DialogContent, ListItemIcon, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { InnovationFlowIcon } from '../InnovationFlowIcon/InnovationFlowIcon';
import useInnovationFlowSettings from './useInnovationFlowSettings';
import InnovationFlowCollaborationToolsBlock from './InnovationFlowCollaborationToolsBlock';
import PageContentBlockContextualMenu from '@/core/ui/content/PageContentBlockContextualMenu';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { Identifiable } from '@/core/utils/Identifiable';
import ApplySpaceTemplateDialog from '@/domain/templates/components/Dialogs/ApplySpaceTemplateDialog';
import { useScreenSize } from '@/core/ui/grid/constants';
import { ImportFlowOptions } from './useInnovationFlowSettings';
import { Caption } from '@/core/ui/typography';

export type InnovationFlowSettingsDialogProps = {
  open?: boolean;
  onClose: () => void;
  collaborationId: string | undefined;
};

const InnovationFlowSettingsDialog = ({
  open = false,
  onClose,
  collaborationId,
}: InnovationFlowSettingsDialogProps) => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();

  const { data, actions, state } = useInnovationFlowSettings({
    collaborationId,
    skip: !open,
  });
  const { innovationFlow, callouts } = data;

  const [importInnovationFlowDialogOpen, setImportInnovationFlowDialogOpen] = useState(false);
  const [selectedTemplateToImport, setSelectedTemplateToImport] = useState<Identifiable>();
  const [isImporting, setIsImporting] = useState(false);

  const handleImportInnovationFlowFromSpaceTemplate = async (
    { id: templateId }: Identifiable,
    options?: ImportFlowOptions
  ) => {
    // Close dialogs immediately and show loading state
    setSelectedTemplateToImport(undefined);
    setImportInnovationFlowDialogOpen(false);
    setIsImporting(true);

    try {
      await actions.importInnovationFlowFromSpaceTemplate(templateId, options);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <DialogWithGrid
        open={open}
        columns={12}
        onClose={onClose}
        fullScreen={isSmallScreen}
        aria-labelledby="innovation-flow-settings-dialog-title"
      >
        <DialogHeader
          icon={<InnovationFlowIcon />}
          title={t('components.innovationFlowSettings.title')}
          id="innovation-flow-settings-dialog-title"
          onClose={onClose}
          actions={
            <PageContentBlockContextualMenu>
              {({ closeMenu }) => {
                return (
                  <MenuItem
                    onClick={() => {
                      setImportInnovationFlowDialogOpen(true);
                      closeMenu();
                    }}
                  >
                    <ListItemIcon>
                      <InnovationFlowIcon />
                    </ListItemIcon>
                    {t('components.innovationFlowSettings.stateEditor.selectDifferentFlow.title')}
                  </MenuItem>
                );
              }}
            </PageContentBlockContextualMenu>
          }
        >
          {isImporting && (
            <Box display="flex" alignItems="center" gap={1} marginLeft={2}>
              <CircularProgress size={16} />
              <Caption>{t('components.innovationFlowSettings.importing')}</Caption>
            </Box>
          )}
        </DialogHeader>
        <DialogContent>
          <InnovationFlowCollaborationToolsBlock
            callouts={callouts}
            loading={state.loading}
            innovationFlow={innovationFlow}
            onUpdateCurrentState={actions.updateInnovationFlowCurrentState}
            onUpdateFlowStateOrder={actions.updateInnovationFlowStateOrder}
            onUpdateCalloutFlowState={actions.updateCalloutFlowState}
            onCreateFlowState={(state, options) => actions.createState(state, options.after)}
            onEditFlowState={actions.editState}
            onDeleteFlowState={actions.deleteState}
          />
        </DialogContent>
      </DialogWithGrid>
      <ApplySpaceTemplateDialog
        open={Boolean(selectedTemplateToImport)}
        onConfirm={options => handleImportInnovationFlowFromSpaceTemplate(selectedTemplateToImport!, options)}
        onClose={() => setSelectedTemplateToImport(undefined)}
        existingCalloutsCount={callouts.length}
      />
      <ImportTemplatesDialog
        open={importInnovationFlowDialogOpen}
        templateType={TemplateType.Space}
        onClose={() => setImportInnovationFlowDialogOpen(false)}
        onSelectTemplate={async templateId => setSelectedTemplateToImport(templateId)}
        enablePlatformTemplates
        actionButton={() => (
          <Button startIcon={<SystemUpdateAltIcon />} variant="contained">
            {t('buttons.use')}
          </Button>
        )}
      />
    </>
  );
};

export default InnovationFlowSettingsDialog;
