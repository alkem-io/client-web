import { FC, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { delay } from 'lodash';
import { gutters } from '@core/ui/grid/utils';
import { Text } from '@core/ui/typography';
import { ShareButton, ShareOnPlatformButtonProps, ShareOnPlatformHandlerProps } from '../ShareDialog';

export const ShareOnClipboardButton: FC<ShareOnPlatformButtonProps> = ({ setShareHandler, ...props }) => {
  const { t } = useTranslation();

  return (
    <ShareButton
      startIcon={<ContentCopyIcon />}
      color="primary"
      variant="outlined"
      onClick={() => setShareHandler(ClipboardShareHandler)}
      {...props}
    >
      {t('share-dialog.platforms.clipboard.title')}
    </ShareButton>
  );
};

const ClipboardShareHandler: FC<ShareOnPlatformHandlerProps> = forwardRef<
  HTMLDivElement | null,
  ShareOnPlatformHandlerProps
>(({ url, closeDialog }, _ref) => {
  const { t } = useTranslation();

  // On render of this element we copy the url to clipboard
  navigator.clipboard.writeText(url);

  // Close the dialog in a few seconds
  delay(() => {
    closeDialog();
  }, 1000);

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
});
