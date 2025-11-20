import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { gutters } from '@/core/ui/grid/utils';
import { isAbsoluteUrl } from '@/core/utils/links';
import { Box, Button, ButtonProps, DialogContent, Skeleton, TextField } from '@mui/material';
import { FC, PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShareOnAlkemioButton } from './platforms/ShareOnAlkemio';
import { AlkemioShareHandler } from './platforms/ShareOnAlkemio';
import { ShareOnClipboardButton } from './platforms/ShareOnClipboard';
import { ClipboardShareHandler } from './platforms/ShareOnClipboard';

const buildFullUrl = (url: string) =>
  isAbsoluteUrl(url) ? url : window.location.protocol + '//' + window.location.host + url;

export interface ShareComponentProps extends PropsWithChildren {
  url: string;
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
  loading?: boolean;
  onClose?: () => void;
}

export interface ShareDialogProps extends ShareComponentProps {
  open: boolean;
  onClose: () => void;
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

export const ShareComponent: FC<ShareComponentProps> = ({ url, entityTypeName, loading, onClose, children }) => {
  const { t } = useTranslation();
  const [activeHandler, setActiveHandler] = useState<string>();
  const fullUrl = useMemo(() => buildFullUrl(url), [url]);

  const handleDialogClose = useCallback(() => {
    setActiveHandler(undefined);
    onClose?.();
  }, [onClose]);

  const handleClick = e => {
    e.target.select();
  };

  if (!url || loading) {
    return <Skeleton variant="rectangular" />;
  }

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
      {children && <Box>{children}</Box>}
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
