import React, { FC, ReactNode, useState } from 'react';
import { Box, Button, IconButton, IconButtonProps, Tooltip } from '@mui/material';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { AdvancedShareDialog, AdvancedShareComponentProps } from './AdvancedShareDialog';

interface ShareButtonProps extends AdvancedShareComponentProps {
  disabled?: boolean;
  title?: ReactNode;
  tooltip?: string;
  tooltipIfDisabled?: string;
  sx?: IconButtonProps['sx'];
}

const ShareButton: FC<ShareButtonProps> = ({
  disabled = false,
  title = undefined,
  tooltip = '',
  tooltipIfDisabled = '',
  sx,
  ...dialogProps
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Tooltip title={disabled ? tooltipIfDisabled : tooltip} arrow placement="top">
        <Box>
          {title ? (
            <Button
              variant="contained"
              color="primary"
              aria-haspopup="true"
              aria-controls={dialogOpen ? 'share-dialog' : undefined}
              aria-expanded={dialogOpen ? 'true' : undefined}
              onClick={() => setDialogOpen(true)}
              disabled={disabled}
              sx={{ width: '100%', ...sx }}
            >
              <ShareOutlinedIcon sx={{ marginRight: theme => theme.spacing(2) }} />
              {title}
            </Button>
          ) : (
            <IconButton
              aria-haspopup="true"
              aria-controls={dialogOpen ? 'share-dialog' : undefined}
              aria-expanded={dialogOpen ? 'true' : undefined}
              onClick={() => setDialogOpen(true)}
              disabled={disabled}
              sx={{ color: theme => theme.palette.primary.main, ...sx }}
            >
              <ShareOutlinedIcon />
              {title}
            </IconButton>
          )}
        </Box>
      </Tooltip>
      <AdvancedShareDialog open={dialogOpen} {...dialogProps} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default ShareButton;
