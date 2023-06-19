import { FC } from 'react';
import { ClickAwayListener, Paper, Popper, PopperProps } from '@mui/material';
import { POPPER_Z_INDEX } from '../../../../domain/communication/room/Comments/CommentInputField';
import EmojiPicker, { EmojiStyle, SkinTonePickerLocation } from 'emoji-picker-react';

interface EmojiSelectorProps {
  anchorElement: PopperProps['anchorEl'];
  open: boolean;
  onClose: () => void;
  onEmojiClick: (emoji: string, event: MouseEvent) => void;
}

const EmojiSelector: FC<EmojiSelectorProps> = ({ anchorElement, open, onEmojiClick, onClose }) => {
  return (
    <Popper open={open} placement="bottom-start" anchorEl={anchorElement} sx={{ zIndex: POPPER_Z_INDEX }}>
      <ClickAwayListener onClickAway={onClose}>
        <Paper elevation={3}>
          <EmojiPicker
            autoFocusSearch={false}
            emojiStyle={EmojiStyle.NATIVE}
            skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
            onEmojiClick={(emoji, event) => onEmojiClick(emoji.emoji, event)}
          />
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default EmojiSelector;
