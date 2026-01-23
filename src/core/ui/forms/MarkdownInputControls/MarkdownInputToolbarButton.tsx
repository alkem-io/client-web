import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

export type MarkdownInputToolbarButtonProps = IconButtonProps & { tooltip: string } & {
  ref?: React.Ref<HTMLButtonElement>;
};
/**
 * For some strange reason the markdown editor is passing a few invalid properties:
 * indicator, fullWidth, selectionFollowsFocus, textColor
 * in all the buttons props and react is throwing a warning to the browser console.
 * Filtering here the invalid props
 */
const MarkdownInputToolbarButton = ({
  ref,
  tooltip,
  hidden,
  ...props
}: MarkdownInputToolbarButtonProps & {
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  if (hidden) {
    return null;
  }
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
};

export default MarkdownInputToolbarButton;
