import { useRef, useState, useEffect, ChangeEvent } from 'react';

import { styled } from '@mui/system';
import { Form, Formik } from 'formik';
import { Editor } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, IconButtonProps } from '@mui/material';
import { useNotification } from '@/core/ui/notifications/useNotification';
import SmartScreenOutlinedIcon from '@mui/icons-material/SmartScreenOutlined';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';

import Gutters from '@/core/ui/grid/Gutters';
import { BlockTitle } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';

interface InsertVideoButtonProps extends IconButtonProps {
  editor: Editor | null;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

const validSources = [
  'https://player.vimeo.com/video/', // Vimeo
  'https://www.youtube.com/embed/', // YouTube
  'https://demo.arcade.software/', // Arcade
  'https://issuu.com/', // Issuu
];

export const InsertVideoButton = ({ editor, onDialogOpen, onDialogClose, ...buttonProps }: InsertVideoButtonProps) => {
  const [src, setSrc] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { t } = useTranslation();

  const notify = useNotification();

  const buttonRef = useRef<HTMLButtonElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOnCloseDialog = () => {
    setIsDialogOpen(false);
    editor?.commands.focus();
    onDialogClose?.();
    setSrc('');
  };

  const blue = {
    100: '#DAECFF',
    200: '#b6daff',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    900: '#003A75',
  };

  const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
  };

  const Textarea = styled(BaseTextareaAutosize)(
    ({ theme }) => `
    box-sizing: border-box;
    width: 320px;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 12px;
    border-radius: 12px 12px 0;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};

    &:hover {
      border-color: ${blue[400]};
    }

    &:focus {
      outline: 0;
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
    }

    /* firefox */
    &:focus-visible {
      outline: 0;
    }
  `
  );

  const handleOnIconButtonClick = () => {
    setIsDialogOpen(true);
  };

  const handleOnTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPosition = event.target.selectionStart;

    setSrc(event.target.value);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = cursorPosition;
        textareaRef.current.selectionEnd = cursorPosition;
      }
    }, 0);
  };

  const handleOnSubmitIframe = () => {
    const srcMatch = src.match(/src="([^"]+)"/);

    if (!srcMatch) {
      notify(t('components.wysiwyg-editor.embed.invalidOrUnsupportedEmbed'), 'error');

      return;
    }

    const isValidSource = validSources.some(validSrc => src.includes(validSrc));

    if (!isValidSource) {
      notify(t('components.wysiwyg-editor.embed.invalidOrUnsupportedEmbed'), 'error');

      return;
    }

    const srcValue = srcMatch[1];

    try {
      editor?.commands.setIframe({ src: srcValue });
    } catch (error) {
      if (error instanceof Error) {
        notify(error.message, 'error');
      }

      throw error;
    }

    handleOnCloseDialog();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [src]);

  const isIconButtonDisabled = !editor || !editor.can().insertContent('');

  return (
    <>
      <IconButton
        ref={buttonRef}
        disabled={isIconButtonDisabled}
        onClick={handleOnIconButtonClick}
        aria-label={t('components.wysiwyg-editor.toolbar.emoji.emoji')}
        {...buttonProps}
      >
        <SmartScreenOutlinedIcon />
      </IconButton>

      <DialogWithGrid open={isDialogOpen} onClose={handleOnCloseDialog}>
        <DialogHeader onClose={handleOnCloseDialog}>
          <BlockTitle>{t('components.wysiwyg-editor.toolbar.embed.video')}</BlockTitle>
        </DialogHeader>

        <Formik initialValues={{ src: '' }} onSubmit={handleOnSubmitIframe}>
          <Form>
            <Gutters>
              <Textarea
                ref={textareaRef}
                value={src}
                minRows={7}
                maxLength={MARKDOWN_TEXT_LENGTH}
                sx={{ width: '100%', maxWidth: '100%', minWidth: '100%' }}
                placeholder={t('components.wysiwyg-editor.embed.pasteEmbedCode')}
                onChange={handleOnTextareaChange}
                aria-label={t('components.wysiwyg-editor.embed.embedCodeTextAreaAriaLabel')}
              />

              <Actions justifyContent="space-between">
                <Button onClick={handleOnCloseDialog}>{t('buttons.cancel')}</Button>

                <Button type="submit" variant="contained">
                  {t('buttons.insert')}
                </Button>
              </Actions>
            </Gutters>
          </Form>
        </Formik>
      </DialogWithGrid>
    </>
  );
};
