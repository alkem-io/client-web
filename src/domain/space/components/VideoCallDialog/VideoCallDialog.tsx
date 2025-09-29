import { Button, DialogActions, DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { BlockTitle } from '@/core/ui/typography';
import { VideocamOutlined } from '@mui/icons-material';

export interface VideoCallDialogProps {
  open: boolean;
  onClose: () => void;
}

const VideoCallDialog = ({ open, onClose }: VideoCallDialogProps) => {
  const { t } = useTranslation();

  const handleStartVideoCall = () => {
    // Open Jitsi in a new tab
    const jitsiUrl = 'https://meet.jit.si/alkemio-video-call-' + Date.now();
    window.open(jitsiUrl, '_blank');
    onClose();
  };

  return (
    <DialogWithGrid columns={6} open={open} onClose={onClose} aria-labelledby="video-call-dialog">
      <DialogHeader
        id="video-call-dialog"
        title={t('videoCall.dialog.title')}
        icon={<VideocamOutlined />}
        onClose={onClose}
      />
      <DialogContent>
        <BlockTitle>{t('videoCall.dialog.content')}</BlockTitle>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          {t('buttons.cancel')}
        </Button>
        <Button onClick={handleStartVideoCall} variant="contained">
          {t('buttons.continue')}
        </Button>
      </DialogActions>
    </DialogWithGrid>
  );
};

export default VideoCallDialog;
