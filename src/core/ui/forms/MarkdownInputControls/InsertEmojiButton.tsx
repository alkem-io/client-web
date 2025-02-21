import { Editor } from '@tiptap/react';
import { useRef, useState } from 'react';
import { EmojiEmotionsOutlined } from '@mui/icons-material';
import { useNotification } from '@/core/ui/notifications/useNotification';
import EmojiSelector from '../emoji/EmojiSelector';
import { useTranslation } from 'react-i18next';
import MarkdownInputToolbarButton, { MarkdownInputToolbarButtonProps } from './MarkdownInputToolbarButton';

interface InsertEmojiButtonProps extends Omit<MarkdownInputToolbarButtonProps, 'tooltip'> {
  editor: Editor | null;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

const InsertEmojiButton = ({ editor, onDialogOpen, onDialogClose, ...buttonProps }: InsertEmojiButtonProps) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => {
    onDialogOpen?.();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    editor?.commands.focus();
    onDialogClose?.();
  };

  const notify = useNotification();

  const insertEmoji = (emoji: string) => {
    try {
      editor?.commands.insertContent(emoji);
    } catch (error) {
      if (error instanceof Error) {
        notify(error.message, 'error');
      }
      throw error;
    }
    closeDialog();
  };

  const isDisabled = !editor || !editor.can().insertContent('');

  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <MarkdownInputToolbarButton
        ref={buttonRef}
        onClick={openDialog}
        disabled={isDisabled}
        tooltip={t('components.wysiwyg-editor.toolbar.emoji.emoji')}
        {...buttonProps}
      >
        <EmojiEmotionsOutlined />
      </MarkdownInputToolbarButton>
      <EmojiSelector
        open={isDialogOpen}
        onClose={closeDialog}
        anchorElement={buttonRef.current}
        onEmojiClick={insertEmoji}
      />
    </>
  );
};

export default InsertEmojiButton;
