import React, { FC } from 'react';
import { Box, IconButton, IconButtonProps, Tooltip } from '@mui/material';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';

interface ShareButtonProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  enabled?: boolean;
  tooltip?: string;
  tooltipIfDisabled?: string;
  sx?: IconButtonProps['sx'];
}

const ShareButton: FC<ShareButtonProps> = ({
  dialogOpen,
  setDialogOpen,
  sx,
  enabled = true,
  tooltip = '',
  tooltipIfDisabled = '',
}) => {
  return (
    <Tooltip title={enabled ? tooltip : tooltipIfDisabled} arrow placement="top">
      <Box>
        <IconButton
          aria-haspopup="true"
          aria-controls={dialogOpen ? 'share-dialog' : undefined}
          aria-expanded={dialogOpen ? 'true' : undefined}
          onClick={() => setDialogOpen(true)}
          disabled={!enabled}
          sx={sx}
        >
          <ShareOutlinedIcon />
        </IconButton>
      </Box>
    </Tooltip>
  );
};

export default ShareButton;
