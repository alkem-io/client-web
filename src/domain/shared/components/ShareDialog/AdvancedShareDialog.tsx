import React, { ComponentType, FC, useState } from 'react';
import { Box, Button, ButtonProps, Dialog, Skeleton, TextField } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { PageTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import { ShareOnAlkemioButton } from './platforms/Alkemio';
import { ShareOnClipboardButton } from './platforms/Clipboard';
import { DialogContent } from '../../../../common/components/core/dialog';

interface AdvancedShareDialogProps extends AdvancedShareComponentProps {
  open: boolean;
  onClose: () => void;
  entityTypeName: 'hub' | 'challenge' | 'opportunity' | 'user' | 'organization' | 'callout' | 'card' | 'canvas';
}

export const AdvancedShareDialog: FC<AdvancedShareDialogProps> = ({ open, onClose, entityTypeName, ...props }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <PageTitle>{t('share-dialog.share-this', { entity: t(`common.${entityTypeName}` as const) })}</PageTitle>
      </DialogHeader>
      <DialogContent>
        <AdvancedShareComponent onClose={onClose} entityTypeName={entityTypeName} {...props} />
      </DialogContent>
    </Dialog>
  );
};

export interface AdvancedShareComponentProps {
  url: string | undefined;
  entityTypeName: AdvancedShareDialogProps['entityTypeName'];
  loading?: boolean;
  onClose?: () => void;
}

export const AdvancedShareComponent: FC<AdvancedShareComponentProps> = ({ url, entityTypeName, loading, onClose }) => {
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
  entityTypeName: AdvancedShareDialogProps['entityTypeName'];
  goBack: () => void;
  closeDialog: () => void;
}

export interface ShareOnPlatformButtonProps extends ButtonProps {
  setShareHandler: (handler: ComponentType<ShareOnPlatformHandlerProps>) => void;
}

export const ShareButton: FC<ButtonProps> = ({ ...props }) => {
  return <Button sx={{ height: gutters(2) }} {...props} />;
};
