import { useRef, useState, useEffect, ChangeEvent, useMemo } from 'react';

import { Form, Formik } from 'formik';
import { Editor } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, IconButtonProps, styled } from '@mui/material';
import { useNotification } from '@/core/ui/notifications/useNotification';
import SmartScreenOutlinedIcon from '@mui/icons-material/SmartScreenOutlined';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';

import Gutters from '@/core/ui/grid/Gutters';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { gutters } from '@/core/ui/grid/utils';

interface InsertEmbedCodeButtonProps extends IconButtonProps {
  editor: Editor | null;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

const validSources = [
  'https://issuu.com', // Important - not tested because in order to get embed code from this site one must have account with paid plan!
  'https://www.youtube.com',
  'https://player.vimeo.com',
  'https://demo.arcade.software',
];

export const InsertEmbedCodeButton = ({
  editor,
  onDialogOpen,
  onDialogClose,
  ...buttonProps
}: InsertEmbedCodeButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { t } = useTranslation();

  const notify = useNotification();

  const buttonRef = useRef<HTMLButtonElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOnCloseDialog = () => {
    setIsDialogOpen(false);
    editor?.commands.focus();
    onDialogClose?.();
  };

  const Textarea = styled(BaseTextareaAutosize)(
    ({ theme }) => `
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    min-width: 100%;
    font-family: monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    padding: ${gutters(0.5)(theme)};
    border-radius: ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0;
    color: ${theme.palette.grey[900]};
    background: ${theme.palette.background.default};
    border: 1px solid ${theme.palette.grey[200]};

    &:hover {
      border-color: ${theme.palette.grey[400]};
    }

    &:focus {
      outline: 0;
      border-color: ${theme.palette.grey[400]};
      box-shadow: 0 0 0 1px ${theme.palette.grey[200]};
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

  const handleOnSubmitIframe = ({ src }: { src: string }) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(src, 'text/html');
    const iframe = doc.querySelector('iframe');

    if (!iframe) {
      notify(t('components.wysiwyg-editor.embed.invalidOrUnsupportedEmbed'), 'error');
      return;
    }

    const embedCodeSrc = iframe.getAttribute('src');

    if (!embedCodeSrc) {
      notify(t('components.wysiwyg-editor.embed.invalidOrUnsupportedEmbed'), 'error');
      return;
    }

    const srcOrigin = new URL(embedCodeSrc).origin;
    const isValidSource = validSources.some(vS => vS === srcOrigin);

    if (!isValidSource) {
      notify(t('components.wysiwyg-editor.embed.invalidOrUnsupportedEmbed'), 'error');
      return;
    }

    try {
      editor?.commands.setIframe({ src: embedCodeSrc });
    } catch (error) {
      if (error instanceof Error) {
        notify(error.message, 'error');
      }

      throw error;
    }

    handleOnCloseDialog();
  };

  useEffect(() => {
    setTimeout(() => {
      if (isDialogOpen) {
        textareaRef?.current?.focus();
      }
    }, 10);
  }, [textareaRef?.current, isDialogOpen]);

  const isIconButtonDisabled = !editor || !editor.can().insertContent('');
  const initialValues = useMemo(() => ({ src: '' }), []);

  return (
    <>
      <IconButton
        ref={buttonRef}
        disabled={isIconButtonDisabled}
        onClick={handleOnIconButtonClick}
        aria-label={t('components.wysiwyg-editor.toolbar.embed.video')}
        {...buttonProps}
      >
        <SmartScreenOutlinedIcon />
      </IconButton>

      <DialogWithGrid open={isDialogOpen} onClose={handleOnCloseDialog}>
        <DialogHeader title={t('components.wysiwyg-editor.embed.dialogTitle')} onClose={handleOnCloseDialog} />
        <Formik initialValues={initialValues} onSubmit={handleOnSubmitIframe}>
          {({ setFieldValue, values }) => (
            <Form>
              <Gutters>
                <Textarea
                  ref={textareaRef}
                  value={values.src}
                  minRows={7}
                  maxLength={MARKDOWN_TEXT_LENGTH}
                  placeholder={t('components.wysiwyg-editor.embed.pasteEmbedCode')}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setFieldValue('src', event.target.value)}
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
          )}
        </Formik>
      </DialogWithGrid>
    </>
  );
};
