import TranslationKey from '@/core/i18n/utils/TranslationKey';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption, Text } from '@/core/ui/typography';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { Button, Dialog, DialogActions, DialogContent, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ImportFlowOptions } from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';

export enum FlowReplaceOption {
  REPLACE_ALL = 'replace_all',
  ADD_TEMPLATE_POSTS = 'add_template',
  FLOW_ONLY = 'flow_only',
}

interface ApplySpaceTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (options: ImportFlowOptions) => Promise<unknown> | void;
}

const OPTIONS = [
  {
    value: FlowReplaceOption.REPLACE_ALL,
    labelKey:
      'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.option1.label' as TranslationKey,
    descriptionKey:
      'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.option1.description' as TranslationKey,
  },
  {
    value: FlowReplaceOption.ADD_TEMPLATE_POSTS,
    labelKey:
      'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.option2.label' as TranslationKey,
    descriptionKey:
      'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.option2.description' as TranslationKey,
  },
  {
    value: FlowReplaceOption.FLOW_ONLY,
    labelKey:
      'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.option3.label' as TranslationKey,
    descriptionKey:
      'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.option3.description' as TranslationKey,
  },
] as const;

const ApplySpaceTemplateDialog: React.FC<ApplySpaceTemplateDialogProps> = ({ open, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<FlowReplaceOption>(FlowReplaceOption.ADD_TEMPLATE_POSTS);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

  const [handleConfirm, loading] = useLoadingState(async () => {
    // Show confirmation dialog for destructive Option 1
    if (selectedOption === FlowReplaceOption.REPLACE_ALL) {
      setConfirmDeleteDialogOpen(true);
      return;
    }

    // For non-destructive options, proceed immediately
    await executeConfirm();
  });

  const executeConfirm = async () => {
    const options: ImportFlowOptions = {
      addCallouts: selectedOption !== FlowReplaceOption.FLOW_ONLY,
      deleteExistingCallouts: selectedOption === FlowReplaceOption.REPLACE_ALL,
    };
    await onConfirm(options);
    onClose();
  };

  const handleConfirmDelete = async () => {
    setConfirmDeleteDialogOpen(false);
    await executeConfirm();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogHeader
          onClose={onClose}
          title={t('components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.title')}
        />
        <DialogContent>
          <Gutters disablePadding>
            <Caption>
              <Trans
                i18nKey="components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.description"
                components={{
                  b: <strong />,
                  br: <br />,
                }}
              />
            </Caption>
            <RadioGroup
              value={selectedOption}
              onChange={event => setSelectedOption(event.target.value as FlowReplaceOption)}
            >
              <Gutters disablePadding>
                {OPTIONS.map(option => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={
                      <>
                        <Text sx={{ fontWeight: 'bold' }}>
                          <>{t(option.labelKey)}</>
                        </Text>
                        <Caption>
                          <>{t(option.descriptionKey)}</>
                        </Caption>
                      </>
                    }
                  />
                ))}
              </Gutters>
            </RadioGroup>
          </Gutters>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={onClose}>
            {t('buttons.cancel')}
          </Button>
          <Button variant="contained" onClick={handleConfirm} loading={loading}>
            {t('components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.apply')}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog
        entities={{
          titleId:
            'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.confirmDelete.title',
          contentId:
            'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.confirmDelete.description',
          confirmButtonTextId: 'buttons.confirm',
        }}
        actions={{
          onConfirm: () => void handleConfirmDelete(),
          onCancel: () => setConfirmDeleteDialogOpen(false),
        }}
        options={{
          show: confirmDeleteDialogOpen,
        }}
        state={{
          isLoading: loading,
        }}
      />
    </>
  );
};

export default ApplySpaceTemplateDialog;
