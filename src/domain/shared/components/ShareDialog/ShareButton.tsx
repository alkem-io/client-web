import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { Button, IconButton, type IconButtonProps, Tooltip } from '@mui/material';
import { type FC, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SwapColors from '@/core/ui/palette/SwapColors';
import { type ShareComponentProps, ShareDialog } from './ShareDialog';

interface ShareButtonProps extends Omit<ShareComponentProps, 'url'> {
  url: string | undefined;
  disabled?: boolean;
  title?: ReactNode;
  tooltip?: string;
  tooltipIfDisabled?: string;
  sx?: IconButtonProps['sx'];
  showShareOnAlkemio?: boolean;
  resetDialogTheme?: boolean;
}

const ShareButton: FC<ShareButtonProps> = ({
  url,
  disabled = false,
  title = undefined,
  tooltip = '',
  tooltipIfDisabled = '',
  sx,
  showShareOnAlkemio = true,
  resetDialogTheme = false,
  ...dialogProps
}) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!url) {
    return null;
  }

  return (
    <>
      <Tooltip title={disabled ? tooltipIfDisabled : tooltip} arrow={true} placement="top">
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
            sx={{ color: theme => theme.palette.text.primary, ...sx }}
          >
            <ShareOutlinedIcon />
          </IconButton>
        )}
      </Tooltip>
      <SwapColors swap={resetDialogTheme}>
        <ShareDialog
          open={dialogOpen}
          url={url}
          showShareOnAlkemio={showShareOnAlkemio}
          {...dialogProps}
          onClose={() => setDialogOpen(false)}
        />
      </SwapColors>
    </>
  );
};

export default ShareButton;
