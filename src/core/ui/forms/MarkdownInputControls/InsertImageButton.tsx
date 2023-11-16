import { Button, IconButton, IconButtonProps } from '@mui/material';
import { Editor } from '@tiptap/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import FormikFileInput from '../FormikFileInput/FormikFileInput';
import { AddPhotoAlternateOutlined } from '@mui/icons-material';
import DialogHeader from '../../dialog/DialogHeader';
import Gutters from '../../grid/Gutters';
import { Actions } from '../../actions/Actions';
import DialogWithGrid from '../../dialog/DialogWithGrid';
import { useNotification } from '../../notifications/useNotification';
import { BlockTitle } from '../../typography';
import FormikInputField from '../FormikInputField/FormikInputField';

interface InsertImageButtonProps extends IconButtonProps {
  editor: Editor | null;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}

interface ImageProps {
  src: string;
  alt: string;
}

const InsertImageButton = ({ editor, onDialogOpen, onDialogClose, ...buttonProps }: InsertImageButtonProps) => {
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

  const insertImage = (imageProps: ImageProps) => {
    try {
      editor?.commands.setImage(imageProps);
    } catch (error) {
      notify(error.message, 'error');
      throw error;
    }
    closeDialog();
  };

  const initialValues: ImageProps = {
    src: 'https://',
    alt: '',
  };

  const isDisabled = !editor || !editor.can().setImage(initialValues);

  return (
    <>
      <IconButton
        onClick={openDialog}
        disabled={isDisabled}
        aria-label={t('components.wysiwyg-editor.toolbar.image.image')}
        {...buttonProps}
      >
        <AddPhotoAlternateOutlined />
      </IconButton>
      <DialogWithGrid open={isDialogOpen} onClose={closeDialog}>
        <DialogHeader onClose={closeDialog}>
          <BlockTitle>{t('components.wysiwyg-editor.image.dialogHeader')}</BlockTitle>
        </DialogHeader>
        <Formik initialValues={initialValues} onSubmit={insertImage}>
          <Form>
            <Gutters>
              <FormikFileInput title={t('common.url')} name="src" />
              <FormikInputField title={t('common.description')} name="alt" />
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

export default InsertImageButton;
