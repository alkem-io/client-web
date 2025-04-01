import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Checkbox, Dialog, DialogContent, FormControlLabel } from '@mui/material';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EntityConfirmDeleteDialogProps {
  entity: string;
  description?: TranslationKey;
  open: boolean;
  onClose: () => void;
  onDelete: () => Promise<unknown> | void;
}

const EntityConfirmDeleteDialog: FC<EntityConfirmDeleteDialogProps> = ({
  entity,
  description,
  open,
  onClose,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);
  const handleClose = () => {
    setChecked(false);
    onClose();
  };
  const [handleDelete, loading] = useLoadingState(async () => {
    await onDelete();
    setChecked(false);
  });

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader
        onClose={handleClose}
        title={t('components.deleteEntity.confirmDialog.title', { entity: entity })}
      />
      <DialogContent>
        <Gutters disablePadding>
          <Box sx={{ wordWrap: 'break-word' }}>
            <Caption>
              <>{t(description ?? 'components.deleteEntity.confirmDialog.description', { entity: entity })} </>
            </Caption>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={() => setChecked(!checked)} />}
              label={<Caption>{t('components.deleteEntity.confirmDialog.checkbox', { entity: entity })}</Caption>}
            />
            <Actions justifyContent="flex-end" paddingTop={gutters()}>
              <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
              <LoadingButton
                variant="contained"
                disabled={!checked}
                loading={loading}
                onClick={handleDelete}
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
