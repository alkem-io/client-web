import { Button } from '@mui/material';
import { Editor } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import FormikInputField from '../FormikInputField/FormikInputField';
import { LinkOutlined } from '@mui/icons-material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { Actions } from '@/core/ui/actions/Actions';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Selection } from 'prosemirror-state';
import { BlockTitle } from '@/core/ui/typography';
import MarkdownInputToolbarButton, { MarkdownInputToolbarButtonProps } from './MarkdownInputToolbarButton';
import { urlValidator } from '../validator/urlValidator';
import { MID_TEXT_LENGTH } from '../field-length.constants';

interface ToggleLinkButtonProps extends Omit<MarkdownInputToolbarButtonProps, 'tooltip'> {
  editor: Editor | null;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

type LinkProps = { href: string };

const ToggleLinkButton = ({ editor, onDialogOpen, onDialogClose, ...buttonProps }: ToggleLinkButtonProps) => {
  const { t } = useTranslation();
  const wasFocusedRef = useRef<boolean>(false);

  const subscribeToFocus = (editor: Editor) => {
    const markAsFocused = () => {
      wasFocusedRef.current = true;
    };

    editor.on('focus', markAsFocused);

    return () => {
      editor.off('focus', markAsFocused);
    };
  };

  useEffect(() => {
    if (editor) {
      subscribeToFocus(editor);
    }
  }, [editor]);

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

  const markAsLink = (linkProps: LinkProps) => {
    if (!editor) {
      return;
    }

    const { selection } = editor.state;

    try {
      if (!selection.empty) {
        editor.commands.setLink(linkProps);
      } else {
        // If the input hasn't been focused once, the link is inserted at the end.
        const from = wasFocusedRef.current ? selection.from : Selection.atEnd(editor.state.doc).from;
        const to = from + linkProps.href.length;

        editor
          .chain()
          .setTextSelection(from)
          .insertContent(linkProps.href)
          .setTextSelection({ from, to })
          .setLink(linkProps)
          .setTextSelection(to)
          .run();
      }
    } catch (error) {
      if (error instanceof Error) {
        notify(error.message, 'error');
      }
      throw error;
    }

    closeDialog();
  };

  const unmarkAsLink = () => editor?.chain().focus().unsetLink().run();

  const initialValues: LinkProps = { href: 'https://' };

  const validationSchema = yup.object().shape({
    href: urlValidator({ maxLength: MID_TEXT_LENGTH, required: true }),
  });

  const isDisabled = !editor || !editor.can().toggleLink(initialValues);

  const isActive = editor?.isActive('link');

  const handleClick = isActive ? unmarkAsLink : openDialog;

  return (
    <>
      <MarkdownInputToolbarButton
        onClick={handleClick}
        disabled={isDisabled}
        color={isActive ? 'secondary' : undefined}
        tooltip={t('components.wysiwyg-editor.toolbar.link.link')}
        {...buttonProps}
      >
        <LinkOutlined />
      </MarkdownInputToolbarButton>
      <DialogWithGrid open={isDialogOpen} onClose={closeDialog} aria-labelledby="toggle-link-dialog-title">
        <DialogHeader onClose={closeDialog}>
          <BlockTitle id="toggle-link-dialog-title">{t('components.wysiwyg-editor.link.dialogHeader')}</BlockTitle>
        </DialogHeader>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={markAsLink}>
          <Form>
            <Gutters>
              <FormikInputField title={t('common.url')} name="href" />
              <Actions justifyContent="space-between">
                <Button onClick={closeDialog}>{t('buttons.cancel')}</Button>
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

export default ToggleLinkButton;
