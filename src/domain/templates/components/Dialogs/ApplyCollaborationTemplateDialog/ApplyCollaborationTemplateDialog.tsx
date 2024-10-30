import React, { useState } from 'react';
import { Dialog, DialogActions, Button, DialogContent, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import { Trans, useTranslation } from 'react-i18next';
import { Caption, Text } from '../../../../../core/ui/typography';
import useLoadingState from '../../../../shared/utils/useLoadingState';
import { LoadingButton } from '@mui/lab';
import Gutters from '../../../../../core/ui/grid/Gutters';

interface ApplyCollaborationTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (addCallouts: boolean) => Promise<unknown> | void;
}

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
              <FormControlLabel
                value="yes"
                control={<Radio />}
                label={
                  <>
                    <Text sx={{ fontWeight: 'bold' }}>
                      {t('components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.yes')}
                    </Text>
                    <Caption>
                      {t(
                        'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.yesDescription'
                      )}
                    </Caption>
                  </>
                }
              />
              <FormControlLabel
                value="no"
                control={<Radio />}
                label={
                  <>
                    <Text sx={{ fontWeight: 'bold' }}>
                      {t('components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.no')}
                    </Text>
                    <Caption>
                      {t(
                        'components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog.noDescription'
                      )}
                    </Caption>
                  </>
                }
              />
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
