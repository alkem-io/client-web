import { FC, forwardRef, useState } from 'react';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ShareButton, ShareOnPlatformButtonProps, ShareOnPlatformHandlerProps } from '../AdvancedShareDialog';

export const ShareOnClipboardButton: FC<ShareOnPlatformButtonProps> = ({ setShareHandler, ...props }) => {
  const { t } = useTranslation();
  const [alreadyCopied, setAlreadyCopied] = useState(false);


  const ClipboardShareHandler: FC<ShareOnPlatformHandlerProps> =
    forwardRef<HTMLDivElement | null, ShareOnPlatformHandlerProps>(
    ({ url, goBack, closeDialog}, ref) => {
      navigator.clipboard.writeText(url);
      setAlreadyCopied(true);
      goBack();
      return null;
    }
  );

  return (
    <Tooltip arrow title={alreadyCopied ? t('share-dialog.platforms.clipboard.copied') : ''} onClose={() => setAlreadyCopied(false)}>
      <ShareButton startIcon={<ContentCopyIcon />} color="primary" variant="outlined" onClick={() => setShareHandler(ClipboardShareHandler)} {...props}>
        {t('share-dialog.platforms.clipboard.title')}
      </ShareButton>
    </Tooltip>
  );
};
