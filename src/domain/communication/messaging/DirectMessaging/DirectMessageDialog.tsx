import React, { FC, useState } from 'react';
import { Dialog, DialogActions, Box, Alert } from '@mui/material';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogContent from '../../../../common/components/core/dialog/DialogContent';
import { Caption, PageTitle } from '../../../../core/ui/typography/components';
import SendButton from '../../../shared/components/SendButton';
import { LONG_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import GridContainer from '../../../../core/ui/grid/GridContainer';
import { gutters } from '../../../../core/ui/grid/utils';
import { ProfileChip } from '../../../community/contributor/ProfileChip/ProfileChip';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import useLoadingState from '../../../shared/utils/useLoadingState';

const GRID_COLUMNS_DESKTOP = 6;
const GRID_COLUMNS_MOBILE = 3;
export interface MessageReceiverChipData {
  id?: string;
  title?: string;
  city?: string;
  country?: string;
  avatarUri?: string;
}

interface MessageUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<void>;
  messageReceivers?: MessageReceiverChipData[];
  title?: string;
}

interface SendMessageData {
  message: string;
}

export const DirectMessageDialog: FC<MessageUserDialogProps> = ({
  open,
  onClose,
  onSendMessage,
  messageReceivers,
  title,
}) => {
  const { t } = useTranslation();

  const [handleSendMessage, isLoading, error] = useLoadingState(async (values: SendMessageData, { resetForm }) => {
    await onSendMessage(values.message);
    if (!error) {
      setMessageSent(true);
      resetForm();
    }
  });

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

  const breakpoint = useCurrentBreakpoint();

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogHeader onClose={handleClose}>
        <PageTitle>{title}</PageTitle>
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
                  <GridProvider columns={breakpoint === 'xs' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP} force>
                    {messageReceivers?.map((receiver, index) => (
                      <ProfileChip
                        key={receiver.id ?? index}
                        displayName={receiver.title}
                        avatarUrl={receiver.avatarUri}
                        city={receiver.city}
                        country={receiver.country}
                      />
                    ))}
                  </GridProvider>
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
