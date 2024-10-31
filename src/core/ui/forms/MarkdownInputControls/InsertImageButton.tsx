import { useState } from 'react';

import { Form, Formik } from 'formik';
import { Editor } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { AddPhotoAlternateOutlined } from '@mui/icons-material';
import { Button, IconButton, IconButtonProps } from '@mui/material';

import Gutters from '../../grid/Gutters';
import { BlockTitle } from '../../typography';
import { Actions } from '../../actions/Actions';
import DialogHeader from '../../dialog/DialogHeader';
import DialogWithGrid from '../../dialog/DialogWithGrid';
import FormikFileInput from '../FormikFileInput/FormikFileInput';
import FormikInputField from '../FormikInputField/FormikInputField';

import { useNotification } from '../../notifications/useNotification';

const InsertImageButton = ({
  editor,
  temporaryLocation,
  onDialogOpen,
  onDialogClose,
  ...rest
}: InsertImageButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { t } = useTranslation();

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
      if (error instanceof Error) {
        notify(error.message, 'error');
      }

      throw error;
    }

    closeDialog();
  };

  const initialValues: ImageProps = { src: 'https://', alt: '' };
  const isDisabled = !editor || !editor.can().setImage(initialValues);

  return (
    <>
      <IconButton
        disabled={isDisabled}
        onClick={openDialog}
        aria-label={t('components.wysiwyg-editor.toolbar.image.image')}
        {...rest}
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
              <FormikFileInput name="src" title={t('common.url')} temporaryLocation={temporaryLocation} />

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

interface ImageProps {
  src: string;
  alt: string;
}

interface InsertImageButtonProps extends IconButtonProps {
  editor: Editor | null;
  temporaryLocation?: boolean;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
}
