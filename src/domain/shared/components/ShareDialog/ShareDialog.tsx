import React, { ComponentType, FC, useState } from 'react';
import { Box, Button, ButtonProps, Dialog, Skeleton, TextField } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { PageTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import { ShareOnAlkemioButton } from './platforms/ShareOnAlkemio';
import { ShareOnClipboardButton } from './platforms/ShareOnClipboard';
import { DialogContent } from '../../../../core/ui/dialog/deprecated';

export interface ShareDialogProps extends ShareComponentProps {
  open: boolean;
  onClose: () => void;
  entityTypeName:
    | 'space'
    | 'challenge'
    | 'opportunity'
    | 'user'
    | 'organization'
    | 'callout'
    | 'card'
    | 'whiteboard'
    | 'discussion'
    | 'event'
    | 'innovationPack'
    | 'updates'
    | 'about';
}

export const ShareDialog: FC<ShareDialogProps> = ({ open, onClose, entityTypeName, ...props }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <PageTitle>{t('share-dialog.share-this', { entity: t(`common.${entityTypeName}` as const) })}</PageTitle>
      </DialogHeader>
      <DialogContent>
        <ShareComponent onClose={onClose} entityTypeName={entityTypeName} {...props} />
      </DialogContent>
    </Dialog>
  );
};

export interface ShareComponentProps {
  url: string | undefined;
  entityTypeName: ShareDialogProps['entityTypeName'];
  loading?: boolean;
  onClose?: () => void;
}

export const ShareComponent: FC<ShareComponentProps> = ({ url, entityTypeName, loading, onClose }) => {
  const { t } = useTranslation();
  const [ShareHandler, setShareHandler] = useState<ComponentType<ShareOnPlatformHandlerProps>>();
  const fullUrl = window.location.protocol + '//' + window.location.host + url;

  const handleClick = e => {
    e.target.select();
  };

  if (!url || loading) {
    return <Skeleton variant="rectangular" />;
  }

  // Return to the list of available platforms to share
  const goBack = () => setShareHandler(undefined);

  return ShareHandler ? (
    <ShareHandler url={fullUrl} entityTypeName={entityTypeName} goBack={goBack} closeDialog={onClose ?? goBack} />
  ) : (
    <Box display="flex" flexDirection="column" justifyContent="space-between">
      <TextField
        InputProps={{
          readOnly: true,
          onClick: handleClick,
          sx: { color: theme => theme.palette.neutralMedium.dark },
        }}
        label={t('share-dialog.url')}
        value={fullUrl}
        sx={{ flexGrow: 1, minWidth: gutters(13), marginBottom: gutters(1.5) }}
      />

      <ShareOnClipboardButton setShareHandler={setShareHandler} />
      <Box height={gutters(3)} display="flex" flexDirection="column" justifyContent="center" textAlign="center">
        {t('share-dialog.or')}
      </Box>
      <ShareOnAlkemioButton setShareHandler={setShareHandler} />
    </Box>
  );
};

export interface ShareOnPlatformHandlerProps {
  url: string;
  entityTypeName: ShareDialogProps['entityTypeName'];
  goBack: () => void;
  closeDialog: () => void;
}

export interface ShareOnPlatformButtonProps extends ButtonProps {
  setShareHandler: (handler: ComponentType<ShareOnPlatformHandlerProps>) => void;
}

export const ShareButton: FC<ButtonProps> = props => {
  return <Button sx={{ height: gutters(2) }} {...props} />;
};
