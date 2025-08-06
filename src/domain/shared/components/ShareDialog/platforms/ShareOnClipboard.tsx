import { FC, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { gutters } from '@/core/ui/grid/utils';
import { Text } from '@/core/ui/typography';
import { ShareButton, ShareOnPlatformButtonProps, ShareOnPlatformHandlerProps } from '../ShareDialog';

export const ShareOnClipboardButton: FC<ShareOnPlatformButtonProps> = ({ setShareHandler, ...props }) => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    setShareHandler('clipboard');
  }, [setShareHandler]);

  return (
    <ShareButton startIcon={<ContentCopyIcon />} color="primary" variant="outlined" onClick={handleClick} {...props}>
      {t('share-dialog.platforms.clipboard.title')}
    </ShareButton>
  );
};

export const ClipboardShareHandler: FC<ShareOnPlatformHandlerProps> = props => {
  const { t } = useTranslation();

  // Debug logging to see what props we're receiving
  console.log('ClipboardShareHandler props:', props);

  const { url, closeDialog } = props || {};

  useEffect(() => {
    // Only run once, after mount
    if (url) {
      // Copy to clipboard
      navigator.clipboard.writeText(url).catch(() => {
        // Handle failure (optionally notify user)
      });
      // Close dialog after delay
      const timer = setTimeout(closeDialog, 1000);
      return () => clearTimeout(timer);
    }
  }, [url, closeDialog]);

  // And show the user the "Copied!" notification
  return (
    <Text sx={{ textAlign: 'center' }}>
      <CheckRoundedIcon
        sx={{
          verticalAlign: 'middle',
          width: gutters(1),
          marginRight: gutters(0.5),
          color: theme => theme.palette.primary.main,
        }}
      />
      {t('share-dialog.platforms.clipboard.copied')}
    </Text>
  );
};
