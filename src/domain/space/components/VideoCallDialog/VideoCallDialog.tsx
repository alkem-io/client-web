import { Button, DialogActions, DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { BlockTitle } from '@/core/ui/typography';
import { VideocamOutlined } from '@mui/icons-material';
import { buildVideoCallUrl } from '@/main/routing/urlBuilders';

export interface VideoCallDialogProps {
  open: boolean;
  onClose: () => void;
  spaceId: string;
  spaceNameId?: string;
}

const VideoCallDialog = ({ open, onClose, spaceId, spaceNameId }: VideoCallDialogProps) => {
  const { t } = useTranslation();

  const handleStartVideoCall = () => {
    const videoCallUrl = buildVideoCallUrl(spaceId, spaceNameId);
    window.open(videoCallUrl, '_blank');
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
