import { useRef, useState, useEffect, ChangeEvent, useMemo } from 'react';

import { Form, Formik } from 'formik';
import { Editor } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { Button, styled, TextareaAutosize } from '@mui/material';
import { useNotification } from '@/core/ui/notifications/useNotification';
import SmartScreenOutlinedIcon from '@mui/icons-material/SmartScreenOutlined';
import Gutters from '@/core/ui/grid/Gutters';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { gutters } from '@/core/ui/grid/utils';
import { useConfig } from '@/domain/platform/config/useConfig';
import MarkdownInputToolbarButton, { MarkdownInputToolbarButtonProps } from '../MarkdownInputToolbarButton';

interface InsertEmbedCodeButtonProps extends Omit<MarkdownInputToolbarButtonProps, 'tooltip'> {
  editor: Editor | null;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

export const InsertEmbedCodeButton = ({
  editor,
  onDialogOpen,
  onDialogClose,
  ...buttonProps
}: InsertEmbedCodeButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { t } = useTranslation();

  const notify = useNotification();

  const { integration: { iframeAllowedUrls = [] } = {} } = useConfig();

  const buttonRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOnCloseDialog = () => {
    setIsDialogOpen(false);
    editor?.commands.focus();
    onDialogClose?.();
  };

  const Textarea = styled(TextareaAutosize)(
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

  const handleOnClick = () => {
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
    const isValidSource = iframeAllowedUrls.some(vS => vS === srcOrigin);

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

  const isDisabled = !editor || !editor.can().insertContent('');
  const initialValues = useMemo(() => ({ src: '' }), []);

  return (
    <>
      <MarkdownInputToolbarButton
        ref={buttonRef}
        disabled={isDisabled}
        onClick={handleOnClick}
        tooltip={t('components.wysiwyg-editor.toolbar.embed.video')}
        {...buttonProps}
      >
        <SmartScreenOutlinedIcon />
      </MarkdownInputToolbarButton>

      <DialogWithGrid
        open={isDialogOpen}
        onClose={handleOnCloseDialog}
        aria-labelledby="insert-embed-code-dialog-title"
      >
        <DialogHeader
          title={t('components.wysiwyg-editor.embed.dialogTitle')}
          onClose={handleOnCloseDialog}
          id="insert-embed-code-dialog-title"
        />
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
