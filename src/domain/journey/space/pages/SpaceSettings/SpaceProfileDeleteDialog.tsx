import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Checkbox, Dialog, DialogContent, FormControlLabel } from '@mui/material';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { Actions } from '../../../../../core/ui/actions/Actions';
import { Caption } from '../../../../../core/ui/typography';
import { gutters } from '../../../../../core/ui/grid/utils';

interface SpaceProfileDeleteDialogProps {
  entity: string;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const SpaceProfileDeleteDialog: FC<SpaceProfileDeleteDialogProps> = ({ entity, open, onClose, onDelete }) => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose} title={t('components.deleteSpace.confirmDialog.title', { entity: entity })} />
      <DialogContent>
        <Gutters disablePadding>
          <Box sx={{ wordWrap: 'break-word' }}>
            <Caption>{t('components.deleteSpace.confirmDialog.description', { entity: entity })} </Caption>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={() => setChecked(!checked)} />}
              label={<Caption>{t('components.deleteSpace.confirmDialog.checkbox', { entity: entity })}</Caption>}
            />
            <Actions justifyContent="flex-end" paddingTop={gutters()}>
              <Button onClick={onClose}>{t('buttons.cancel')}</Button>
              <Button type="submit" variant="contained" value={'SPACE'} disabled={!checked} onClick={onDelete}>
                {t('components.deleteSpace.confirmDialog.confirm')}
              </Button>
            </Actions>
          </Box>
        </Gutters>
      </DialogContent>
    </Dialog>
  );
};

export default SpaceProfileDeleteDialog;
