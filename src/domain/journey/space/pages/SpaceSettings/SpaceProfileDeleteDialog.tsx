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

interface SpaceProfileDeleteDialogProps {
  entity: string;
  description?: TranslationKey;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  submitting: boolean;
}

const SpaceProfileDeleteDialog: FC<SpaceProfileDeleteDialogProps> = ({
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
      <DialogHeader onClose={onClose} title={t('components.deleteSpace.confirmDialog.title', { entity: entity })} />
      <DialogContent>
        <Gutters disablePadding>
          <Box sx={{ wordWrap: 'break-word' }}>
            <Caption>
              {t(description ?? 'components.deleteSpace.confirmDialog.description', { entity: entity })}{' '}
            </Caption>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={() => setChecked(!checked)} />}
              label={<Caption>{t('components.deleteSpace.confirmDialog.checkbox', { entity: entity })}</Caption>}
            />
            <Actions justifyContent="flex-end" paddingTop={gutters()}>
              <Button onClick={onClose}>{t('buttons.cancel')}</Button>
              <LoadingButton
                variant="contained"
                value={'SPACE'}
                disabled={!checked}
                loading={submitting}
                loadingIndicator={`${t('components.deleteSpace.confirmDialog.confirm')}...`}
                onClick={onDelete}
                sx={{ textWrap: 'nowrap' }}
              >
                {t('components.deleteSpace.confirmDialog.confirm')}
              </LoadingButton>
            </Actions>
          </Box>
        </Gutters>
      </DialogContent>
    </Dialog>
  );
};

export default SpaceProfileDeleteDialog;
