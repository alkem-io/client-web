import { Button } from '@mui/material';
import { Editor } from '@tiptap/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import FormikFileInput from '../FormikFileInput/FormikFileInput';
import { AddPhotoAlternateOutlined } from '@mui/icons-material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { Actions } from '@/core/ui/actions/Actions';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { BlockTitle } from '@/core/ui/typography';
import FormikInputField from '../FormikInputField/FormikInputField';
import MarkdownInputToolbarButton, { MarkdownInputToolbarButtonProps } from './MarkdownInputToolbarButton';

interface InsertImageButtonProps extends Omit<MarkdownInputToolbarButtonProps, 'tooltip'> {
  editor: Editor | null;
  onDialogOpen?: () => void;
  onDialogClose?: () => void;
  temporaryLocation?: boolean;
}

type ImageProps = {
  src: string;
  alt: string;
};

const InsertImageButton = ({
  editor,
  onDialogOpen,
  onDialogClose,
  temporaryLocation = false,
  ...buttonProps
}: InsertImageButtonProps) => {
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
      <MarkdownInputToolbarButton
        onClick={openDialog}
        disabled={isDisabled}
        tooltip={t('components.wysiwyg-editor.toolbar.image.image')}
        {...buttonProps}
      >
        <AddPhotoAlternateOutlined />
      </MarkdownInputToolbarButton>
      <DialogWithGrid open={isDialogOpen} onClose={closeDialog} aria-labelledby="insert-image-dialog-title">
        <DialogHeader onClose={closeDialog}>
          <BlockTitle id="insert-image-dialog-title">{t('components.wysiwyg-editor.image.dialogHeader')}</BlockTitle>
        </DialogHeader>
        <Formik initialValues={initialValues} onSubmit={insertImage}>
          <Form>
            <Gutters>
              <FormikFileInput title={t('common.url')} name="src" temporaryLocation={temporaryLocation} />
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
