import { IconButton, IconButtonProps } from '@mui/material';
import WhiteboardPreviewSettingsIcon from './WhiteboardPreviewSettingsIcon.svg?react';

const WhiteboardPreviewSettingsButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props}>
      <WhiteboardPreviewSettingsIcon />
    </IconButton>
  );
};

export default WhiteboardPreviewSettingsButton;