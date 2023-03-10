import { Button, IconButton, IconButtonProps } from '@mui/material';
import { Editor } from '@tiptap/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { LinkOutlined } from '@mui/icons-material';
import DialogHeader from '../../dialog/DialogHeader';
import Gutters from '../../grid/Gutters';
import { Actions } from '../../actions/Actions';
import Dialog from '../../dialog/Dialog';
import { useNotification } from '../../notifications/useNotification';

interface ToggleLinkButtonProps extends IconButtonProps {
  editor: Editor | null;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

interface LinkProps {
  href: string;
}

const ToggleLinkButton = ({ editor, onDialogOpen, onDialogClose, ...buttonProps }: ToggleLinkButtonProps) => {
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
    try {
      editor?.commands.setLink(linkProps);
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

  const { t } = useTranslation();

  const isDisabled = !editor || !editor.can().toggleLink(initialValues);

  const isActive = editor?.isActive('link');

  const handleClick = isActive ? unmarkAsLink : openDialog;

  return (
    <>
      <IconButton
        onClick={handleClick}
        disabled={isDisabled}
        color={isActive ? 'secondary' : undefined}
        {...buttonProps}
      >
        <LinkOutlined />
      </IconButton>
      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogHeader onClose={closeDialog}>{t('components.wysiwyg-editor.link.dialogHeader')}</DialogHeader>
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
      </Dialog>
    </>
  );
};

export default ToggleLinkButton;
