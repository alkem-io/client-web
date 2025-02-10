import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import { forwardRef } from 'react';

export type MarkdownInputToolbarButtonProps = IconButtonProps & { tooltip: string };
/**
 * For some strange reason the markdown editor is passing a few invalid properties:
 * indicator, fullWidth, selectionFollowsFocus, textColor
 * in all the buttons props and react is throwing a warning to the browser console.
 * Filtering here the invalid props
 */
const MarkdownInputToolbarButton = forwardRef<HTMLButtonElement, MarkdownInputToolbarButtonProps>(
  ({ tooltip, ...props }, ref) => {
    const curedProps = { ...props };
    const removeProps = ['indicator', 'fullWidth', 'selectionFollowsFocus', 'textColor'];
    removeProps.forEach(prop => prop in curedProps && delete curedProps[prop]);

    return (
      <Tooltip title={tooltip} arrow>
        <span>
          <IconButton aria-label={tooltip} {...curedProps} ref={ref} />
        </span>
      </Tooltip>
    );
  }
);

export default MarkdownInputToolbarButton;
