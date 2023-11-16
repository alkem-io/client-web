import { Button, IconButton, IconButtonProps } from '@mui/material';
import { Editor } from '@tiptap/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import FormikInputField from '../FormikInputField/FormikInputField';
import { LinkOutlined } from '@mui/icons-material';
import DialogHeader from '../../dialog/DialogHeader';
import Gutters from '../../grid/Gutters';
import { Actions } from '../../actions/Actions';
import DialogWithGrid from '../../dialog/DialogWithGrid';
import { useNotification } from '../../notifications/useNotification';
import { Selection } from 'prosemirror-state';
import { BlockTitle } from '../../typography';

interface ToggleLinkButtonProps extends IconButtonProps {
  editor: Editor | null;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

interface LinkProps {
  href: string;
}

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
      notify(error.message, 'error');
      throw error;
    }

    closeDialog();
  };

  const unmarkAsLink = () => editor?.chain().focus().unsetLink().run();

  const initialValues: LinkProps = {
    href: 'https://',
  };

  const isDisabled = !editor || !editor.can().toggleLink(initialValues);

  const isActive = editor?.isActive('link');

  const handleClick = isActive ? unmarkAsLink : openDialog;

  return (
    <>
      <IconButton
        onClick={handleClick}
        disabled={isDisabled}
        color={isActive ? 'secondary' : undefined}
        aria-label={t('components.wysiwyg-editor.toolbar.link.link')}
        {...buttonProps}
      >
        <LinkOutlined />
      </IconButton>
      <DialogWithGrid open={isDialogOpen} onClose={closeDialog}>
        <DialogHeader onClose={closeDialog}>
          <BlockTitle>{t('components.wysiwyg-editor.link.dialogHeader')}</BlockTitle>
        </DialogHeader>
        <Formik initialValues={initialValues} onSubmit={markAsLink}>
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
