import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Checkbox, Dialog, DialogContent, FormControlLabel } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { Actions } from '../../../../../core/ui/actions/Actions';
import { Caption } from '../../../../../core/ui/typography';
import { gutters } from '../../../../../core/ui/grid/utils';
import TranslationKey from '../../../../../core/i18n/utils/TranslationKey';

interface EntityConfirmDeleteDialogProps {
  entity: string;
  description?: TranslationKey;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  submitting: boolean;
}

const EntityConfirmDeleteDialog: FC<EntityConfirmDeleteDialogProps> = ({
  entity,
  description,
  open,
  onClose,
  onDelete,
  submitting,
}) => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose} title={t('components.deleteEntity.confirmDialog.title', { entity: entity })} />
      <DialogContent>
        <Gutters disablePadding>
          <Box sx={{ wordWrap: 'break-word' }}>
            <Caption>
              {t(description ?? 'components.deleteEntity.confirmDialog.description', { entity: entity })}{' '}
            </Caption>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={() => setChecked(!checked)} />}
              label={<Caption>{t('components.deleteEntity.confirmDialog.checkbox', { entity: entity })}</Caption>}
            />
            <Actions justifyContent="flex-end" paddingTop={gutters()}>
              <Button onClick={onClose}>{t('buttons.cancel')}</Button>
              <LoadingButton
                variant="contained"
                value={'SPACE'}
                disabled={!checked}
                loading={submitting}
                loadingIndicator={`${t('components.deleteEntity.confirmDialog.confirm')}...`}
                onClick={onDelete}
                sx={{ textWrap: 'nowrap' }}
              >
                {t('components.deleteEntity.confirmDialog.confirm')}
              </LoadingButton>
            </Actions>
          </Box>
        </Gutters>
      </DialogContent>
    </Dialog>
  );
};

export default EntityConfirmDeleteDialog;
