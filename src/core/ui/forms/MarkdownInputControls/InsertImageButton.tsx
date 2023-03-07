import { Button, IconButton, IconButtonProps } from '@mui/material';
import { Editor } from '@tiptap/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { ImageOutlined } from '@mui/icons-material';
import DialogHeader from '../../dialog/DialogHeader';
import Gutters from '../../grid/Gutters';
import { Actions } from '../../actions/Actions';
import Dialog from '../../dialog/Dialog';
import { useNotification } from '../../notifications/useNotification';

interface InsertImageButtonProps extends IconButtonProps {
  editor: Editor | null;
}

interface ImageProps {
  src: string;
}

const InsertImageButton = ({ editor, ...buttonProps }: InsertImageButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => setIsDialogOpen(false);

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
  };

  const { t } = useTranslation();

  return (
    <>
      <IconButton onClick={() => setIsDialogOpen(true)} disabled={!editor} {...buttonProps}>
        <ImageOutlined />
      </IconButton>
      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogHeader onClose={closeDialog}>{t('components.wysiwyg-editor.image.insertImage')}</DialogHeader>
        <Formik initialValues={initialValues} onSubmit={insertImage}>
          <Form>
            <Gutters>
              <FormikInputField title={t('common.url')} name="src" />
              <Actions>
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

export default InsertImageButton;
