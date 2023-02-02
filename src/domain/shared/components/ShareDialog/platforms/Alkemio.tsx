import { FC, forwardRef, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ShareButton, ShareOnPlatformButtonProps, ShareOnPlatformHandlerProps } from '../AdvancedShareDialog';

export const ShareOnAlkemioButton: FC<ShareOnPlatformButtonProps> = ({ setShareHandler, ...props }) => {
  const { t } = useTranslation();
  const ICON_URL = '/share-dialog/alkemio.png';

  return (
    <ShareButton
      startIcon={<Box component="img" src={ICON_URL} />}
      color="primary"
      variant="contained"
      onClick={() => setShareHandler(AlkemioShareHandler)}
    >
      {t('share-dialog.platforms.alkemio.title')}
    </ShareButton>
  );

};

const AlkemioShareHandler: FC<ShareOnPlatformHandlerProps> =
  forwardRef<HTMLDivElement | null, ShareOnPlatformHandlerProps>(
  ({ url, goBack, closeDialog }, ref) => {

  return (
    <Box>
      Share on alkemio: {url}
      <Button onClick={goBack}>Back</Button>
      <Button onClick={closeDialog}>close</Button>
    </Box>
  );
});
