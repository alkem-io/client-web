import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { gutters } from '@/core/ui/grid/utils';
import { isAbsoluteUrl } from '@/core/utils/links';
import { Box, Button, ButtonProps, DialogContent, Skeleton, TextField } from '@mui/material';
import { ComponentType, FC, PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShareOnAlkemioButton } from './platforms/ShareOnAlkemio';
import { ShareOnClipboardButton } from './platforms/ShareOnClipboard';

export interface ShareDialogProps extends ShareComponentProps {
  open: boolean;
  onClose: () => void;
  entityTypeName:
    | 'space'
    | 'subspace'
    | 'subsubspace'
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
    <DialogWithGrid columns={8} open={open} onClose={onClose}>
      <DialogHeader
        title={t('share-dialog.share-this', { entity: t(`common.${entityTypeName}` as const) })}
        onClose={onClose}
      />
      <DialogContent>
        <ShareComponent onClose={onClose} entityTypeName={entityTypeName} {...props} />
      </DialogContent>
    </DialogWithGrid>
  );
};

export interface ShareComponentProps extends PropsWithChildren {
  url: string;
  entityTypeName: ShareDialogProps['entityTypeName'];
  loading?: boolean;
  onClose?: () => void;
}

export const ShareComponent: FC<ShareComponentProps> = ({ url, entityTypeName, loading, onClose, children }) => {
  const { t } = useTranslation();
  const [ShareHandler, setShareHandler] = useState<ComponentType<ShareOnPlatformHandlerProps>>();
  const fullUrl = isAbsoluteUrl(url) ? url : window.location.protocol + '//' + window.location.host + url;

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
      {children}
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
  const { t } = useTranslation();
  return <Button sx={{ height: gutters(2) }} aria-label={t('buttons.share')} {...props} />;
};
