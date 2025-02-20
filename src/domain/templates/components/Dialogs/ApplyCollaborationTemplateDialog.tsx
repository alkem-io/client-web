import TranslationKey from '@/core/i18n/utils/TranslationKey';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption, Text } from '@/core/ui/typography';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface ApplyCollaborationTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (addCallouts: boolean) => Promise<unknown> | void;
}

const OPTIONS = [
  {
    value: 'yes',
    titleKey:
      'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.yes' as TranslationKey,
    descriptionKey:
      'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.yesDescription' as TranslationKey,
  },
  {
    value: 'no',
    titleKey:
      'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.no' as TranslationKey,
    descriptionKey:
      'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.noDescription' as TranslationKey,
  },
] as const;

const ApplyCollaborationTemplateDialog: React.FC<ApplyCollaborationTemplateDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [addCallouts, setAddCallouts] = useState(true);

  const [handleConfirm, loading] = useLoadingState(async () => {
    await onConfirm(addCallouts);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        {t('components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.title')}
      </DialogHeader>
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
            value={addCallouts ? 'yes' : 'no'}
            onChange={event => setAddCallouts(event.target.value === 'yes')}
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
                        <>{t(option.titleKey)}</>
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
        <LoadingButton variant="contained" onClick={handleConfirm} loading={loading}>
          {t('components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.apply')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ApplyCollaborationTemplateDialog;
