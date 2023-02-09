import React, { FC, useState } from 'react';
import { Dialog, DialogActions, Box, Alert } from '@mui/material';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import DialogContent from '../../../common/components/core/dialog/DialogContent';
import { Caption, PageTitle } from '../../../core/ui/typography/components';
import SendButton from '../../shared/components/SendButton';
import { LONG_TEXT_LENGTH } from '../../../core/ui/forms/field-length.constants';
import FormikInputField from '../../../common/components/composite/forms/FormikInputField';
import { ProfileChip } from '../../../common/components/composite/common/ProfileChip/ProfileChip';
import GridContainer from '../../../core/ui/grid/GridContainer';
import { gutters } from '../../../core/ui/grid/utils';

interface MessageUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<void>;
  title?: string;
  city?: string;
  country?: string;
  avatarUri?: string;
}

interface SendMessageData {
  message: string;
}

export const DirectMessageDialog: FC<MessageUserDialogProps> = ({
  open,
  onClose,
  onSendMessage,
  title,
  city,
  country,
  avatarUri,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsloading] = useState(false);
  const handleSendMessage = async (values: SendMessageData, { resetForm }) => {
    setIsloading(true);
    await onSendMessage(values.message);
    resetForm();
    setIsloading(false);
  };

  const handleClose = () => {
    onClose();
  };

  const validationSchema = yup.object().shape({
    message: yup.string().required(t('forms.validations.required')),
  });

  const [isMessageSent, setMessageSent] = useState(false);

  const initialValues: SendMessageData = {
    message: '',
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogHeader onClose={handleClose}>
        <PageTitle>{t('send-message-dialog.title')}</PageTitle>
      </DialogHeader>
      <DialogContent>
        <Box>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={handleSendMessage}
          >
            {({ handleSubmit, isValid }) => (
              <Form noValidate autoComplete="off">
                <GridContainer disablePadding marginBottom={gutters(1)}>
                  <ProfileChip displayName={title} avatarUrl={avatarUri} city={city} country={country} />
                </GridContainer>
                <FormikInputField
                  name="message"
                  title={t('messaging.message')}
                  placeholder={t('messaging.message')}
                  multiline
                  rows={5}
                  onFocus={() => setMessageSent(false)}
                  withCounter
                  maxLength={LONG_TEXT_LENGTH}
                />
                <Caption>{t('share-dialog.warning')}</Caption>

                <DialogActions sx={{ paddingX: 0 }}>
                  {isMessageSent && (
                    <Alert severity="info" sx={{ marginRight: 'auto' }}>
                      {t('messaging.successfully-sent')}
                    </Alert>
                  )}
                  <SendButton loading={isLoading} disabled={!isValid} onClick={() => handleSubmit()} />
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
