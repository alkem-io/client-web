import { IconButton, IconButtonProps } from '@mui/material';
import { WhiteboardPreviewSettingsIcon } from './icons/WhiteboardPreviewIcons';

const WhiteboardPreviewSettingsButton = (props: IconButtonProps) => {
  return (
    <IconButton {...props}>
      <WhiteboardPreviewSettingsIcon />
    </IconButton>
  );
};

export default WhiteboardPreviewSettingsButton;
