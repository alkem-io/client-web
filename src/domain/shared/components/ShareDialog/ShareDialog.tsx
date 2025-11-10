import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { gutters } from '@/core/ui/grid/utils';
import { isAbsoluteUrl } from '@/core/utils/links';
import { Box, Button, ButtonProps, DialogContent, Divider, Skeleton, TextField } from '@mui/material';
import { FC, PropsWithChildren, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShareOnAlkemioButton } from './platforms/ShareOnAlkemio';
import { ShareOnClipboardButton } from './platforms/ShareOnClipboard';

// Import the handler components directly
import { ClipboardShareHandler } from './platforms/ShareOnClipboard';
import { AlkemioShareHandler } from './platforms/ShareOnAlkemio';

export interface ShareDialogProps extends ShareComponentProps {
  open: boolean;
  onClose: () => void;
  entityTypeName:
    | 'space'
    | 'subspace'
    | 'user'
    | 'organization'
    | 'callout'
    | 'discussion'
    | 'event'
    | 'innovationPack'
    | 'updates'
    | 'about'
    | 'post'
    | 'whiteboard'
    | 'link'
    | 'memo';
}

export const ShareDialog = ({ open, onClose, entityTypeName, ...props }: ShareDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid columns={8} open={open} onClose={onClose} aria-labelledby="share-dialog">
      <DialogHeader
        id="share-dialog"
        title={t('share-dialog.share-this', { entity: t(`common.${entityTypeName}`) })}
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
  const [activeHandler, setActiveHandler] = useState<string>();
  const fullUrl = isAbsoluteUrl(url) ? url : window.location.protocol + '//' + window.location.host + url;

  const handleDialogClose = useCallback(() => {
    setActiveHandler(undefined);
    if (onClose) onClose();
  }, [onClose]);

  const handleClick = e => {
    e.target.select();
  };

  if (!url || loading) {
    return <Skeleton variant="rectangular" />;
  }

  // Return to the list of available platforms to share
  const goBack = () => setActiveHandler(undefined);

  const handlerProps: ShareOnPlatformHandlerProps = {
    url: fullUrl,
    entityTypeName,
    goBack,
    closeDialog: handleDialogClose,
  };

  if (activeHandler === 'clipboard') {
    return <ClipboardShareHandler {...handlerProps} />;
  }

  if (activeHandler === 'alkemio') {
    return <AlkemioShareHandler {...handlerProps} />;
  }

  return (
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

      <ShareOnClipboardButton setShareHandler={setActiveHandler} />
      <Box height={gutters(3)} display="flex" flexDirection="column" justifyContent="center" textAlign="center">
        {t('share-dialog.or')}
      </Box>
      <ShareOnAlkemioButton setShareHandler={setActiveHandler} />
      {children && (
        <>
          <Divider orientation="horizontal" sx={{ marginY: gutters(1) }} />
          <Box>{children}</Box>
        </>
      )}
    </Box>
  );
};

export interface ShareOnPlatformHandlerProps {
  ref?: React.Ref<HTMLDivElement>;
  url: string;
  entityTypeName: ShareDialogProps['entityTypeName'];
  goBack: () => void;
  closeDialog: () => void;
}

export interface ShareOnPlatformButtonProps extends ButtonProps {
  setShareHandler: (handler: string) => void;
}

export const ShareButton: FC<ButtonProps> = props => {
  const { t } = useTranslation();
  return <Button sx={{ height: gutters(2) }} aria-label={t('buttons.share')} {...props} />;
};
