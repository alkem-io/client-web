import React, { FC, ReactNode, useState } from 'react';
import { Button, IconButton, IconButtonProps, Tooltip } from '@mui/material';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { ShareDialog, ShareComponentProps } from './ShareDialog';
import { useTranslation } from 'react-i18next';

interface ShareButtonProps extends Omit<ShareComponentProps, 'url'> {
  url: string | undefined;
  disabled?: boolean;
  title?: ReactNode;
  tooltip?: string;
  tooltipIfDisabled?: string;
  sx?: IconButtonProps['sx'];
  showShareOnAlkemio?: boolean;
}

const ShareButton: FC<ShareButtonProps> = ({
  url,
  disabled = false,
  title = undefined,
  tooltip = '',
  tooltipIfDisabled = '',
  sx,
  showShareOnAlkemio = true,
  ...dialogProps
}) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!url) {
    return null;
  }

  return (
    <>
      <Tooltip title={disabled ? tooltipIfDisabled : tooltip} arrow placement="top">
        {title ? (
          <Button
            variant="contained"
            color="primary"
            aria-label={t('buttons.share')}
            aria-haspopup="true"
            onClick={() => setDialogOpen(true)}
            disabled={disabled}
            sx={{ width: '100%', ...sx }}
          >
            <ShareOutlinedIcon sx={{ marginRight: theme => theme.spacing(2) }} />
            {title}
          </Button>
        ) : (
          <IconButton
            aria-label={t('buttons.share')}
            aria-haspopup="true"
            onClick={() => setDialogOpen(true)}
            disabled={disabled}
            sx={{ color: theme => theme.palette.primary.main, ...sx }}
          >
            <ShareOutlinedIcon />
          </IconButton>
        )}
      </Tooltip>
      <ShareDialog
        open={dialogOpen}
        url={url}
        showShareOnAlkemio={showShareOnAlkemio}
        {...dialogProps}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default ShareButton;
