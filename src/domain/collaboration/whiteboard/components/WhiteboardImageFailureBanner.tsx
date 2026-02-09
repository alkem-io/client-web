import { Box, Button } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import type { FileFailureState } from '@/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager';

interface WhiteboardImageFailureBannerProps {
  failureState: FileFailureState;
  onRetry?: () => void;
  retrying?: boolean;
}

/**
 * Banner displayed when whiteboard images fail to load or upload.
 * Shows count of failures and a retry button (T030).
 */
const WhiteboardImageFailureBanner = ({ failureState, onRetry, retrying = false }: WhiteboardImageFailureBannerProps) => {
  const { t } = useTranslation();

  if (!failureState.hasFailures) {
    return null;
  }

  const totalFailures = failureState.uploadFailures.length + failureState.downloadFailures.length;
  const hasDownloadFailures = failureState.downloadFailures.length > 0;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={1}
      sx={theme => ({
        padding: theme.spacing(1, 2),
        backgroundColor: theme.palette.warning.light,
        borderBottom: `1px solid ${theme.palette.warning.main}`,
      })}
      role="alert"
      aria-live="polite"
      data-testid="whiteboard-image-failure-banner"
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Warning fontSize="small" color="warning" />
        <Caption>
          {totalFailures === 1
                ? t('callout.whiteboard.images.singleFailure')
            : t('callout.whiteboard.images.multipleFailures', { count: totalFailures })}
        </Caption>
      </Box>
      {hasDownloadFailures && onRetry && (
        <Button
          size="small"
          variant="outlined"
          onClick={onRetry}
          disabled={retrying}
          sx={{ textTransform: 'none', minWidth: 'auto' }}
        >
          {retrying ? t('common.retrying') : t('callout.whiteboard.images.retry')}
        </Button>
      )}
    </Box>
  );
};

export default WhiteboardImageFailureBanner;
