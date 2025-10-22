import { Button, DialogActions, DialogContent, Link } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { BlockTitle } from '@/core/ui/typography';
import { VideocamOutlined } from '@mui/icons-material';
import { useVideoCall } from '../../hooks/useVideoCall';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useState, useEffect } from 'react';
export interface VideoCallDialogProps {
  open: boolean;
  onClose: () => void;
  spaceNameId?: string;
  spaceId?: string;
}

const VideoCallDialog = ({ open, onClose, spaceNameId, spaceId }: VideoCallDialogProps) => {
  const { t } = useTranslation();
  const { videoCallUrl } = useVideoCall(spaceId, spaceNameId);
  const notify = useNotification();
  const [hasLoggedError, setHasLoggedError] = useState(false);

  // Reset error flag when dialog opens
  useEffect(() => {
    if (open) {
      setHasLoggedError(false);
    }
  }, [open]);

  const handleStartVideoCall = () => {
    if (!videoCallUrl) {
      // Log to Sentry only once per dialog open
      if (!hasLoggedError) {
        logError(new Error('Attempted to open video call with empty URL'), {
          category: TagCategoryValues.UI,
          label: 'VIDEO_CALL_EMPTY_URL',
        });
        setHasLoggedError(true);
      }

      // Notify user
      notify(t('videoCall.error.emptyUrl'), 'error');
      return;
    }

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
        <BlockTitle>
          <Trans
            i18nKey="videoCall.dialog.content"
            components={{
              jitsiLink: (
                <Link
                  underline="always"
                  sx={{
                    color: theme => theme.palette.primary.main,
                    ':hover': { color: theme => theme.palette.secondary.main },
                  }}
                  href="https://alkem.io/docs/features/videocall"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </BlockTitle>
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
