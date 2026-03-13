import { Button, DialogActions, DialogContent, Link } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { Caption } from '@/core/ui/typography';

interface SpaceWelcomeDialogProps {
  onClose: () => void;
}

const SpaceWelcomeDialog = ({ onClose }: SpaceWelcomeDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={true} onClose={onClose} columns={6} aria-labelledby="space-welcome-dialog">
      <DialogHeader id="space-welcome-dialog" title={t('components.spaceWelcomeDialog.title')} onClose={onClose} />
      <DialogContent>
        <Caption alignSelf="center">
          <Trans
            i18nKey="components.spaceWelcomeDialog.description"
            components={{
              b: <strong />,
              br: <br />,
              contact: <Link href={`mailto:${t('common.supportEmail')}`} />,
            }}
          />
        </Caption>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          {t('components.spaceWelcomeDialog.button')}
        </Button>
      </DialogActions>
    </DialogWithGrid>
  );
};

export default SpaceWelcomeDialog;
