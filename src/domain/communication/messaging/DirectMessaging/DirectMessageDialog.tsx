import React, { FC, ReactNode, useState } from 'react';
import { Alert, DialogActions } from '@mui/material';
import { Formik, FormikState } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogContent from '../../../../core/ui/dialog/DialogContent';
import { Caption } from '../../../../core/ui/typography/components';
import SendButton from '../../../shared/components/SendButton';
import { LONG_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import GridContainer from '../../../../core/ui/grid/GridContainer';
import { gutters } from '../../../../core/ui/grid/utils';
import { ProfileChip } from '../../../community/contributor/ProfileChip/ProfileChip';
import useLoadingState from '../../../shared/utils/useLoadingState';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';

export interface MessageReceiverChipData {
  id: string;
  displayName?: string;
  city?: string;
  country?: string;
  avatarUri?: string;
}

interface MessageUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<void>;
  messageReceivers?: MessageReceiverChipData[];
  title?: ReactNode;
}

interface SendMessageData {
  message: string;
}

/**
 * Consider using useDirectMessageDialog hook that has Send Message mutations baked in.
 */
export const DirectMessageDialog: FC<MessageUserDialogProps> = ({
  open,
  onClose,
  onSendMessage,
  messageReceivers,
  title,
}) => {
  const { t } = useTranslation();

  const [isMessageSent, setMessageSent] = useState(false);

  const [handleSendMessage, isLoading, error] = useLoadingState(
    async (
      values: SendMessageData,
      { resetForm }: { resetForm: (nextState?: Partial<FormikState<SendMessageData>>) => void }
    ) => {
      await onSendMessage(values.message);
      if (!error) {
        setMessageSent(true);
        resetForm();
      }
    }
  );

  const handleClose = () => {
    onClose();
    setMessageSent(false);
  };

  const validationSchema = yup.object().shape({
    message: yup.string().required(t('forms.validations.required')),
  });

  const initialValues: SendMessageData = {
    message: '',
  };

  return (
    <DialogWithGrid columns={12} open={open} fullWidth maxWidth="md">
      <DialogHeader title={title} onClose={handleClose} />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSendMessage}
      >
        {({ handleSubmit, isValid }) => (
          <>
            <DialogContent>
              <GridContainer disablePadding marginBottom={gutters(1)}>
                {messageReceivers?.map(receiver => (
                  <ProfileChip
                    key={receiver.id}
                    displayName={receiver.displayName}
                    avatarUrl={receiver.avatarUri}
                    city={receiver.city}
                    country={receiver.country}
                  />
                ))}
              </GridContainer>
              <FormikInputField
                name="message"
                title={t('messaging.message')}
                placeholder={t('messaging.message')}
                multiline
                rows={5}
                onFocus={() => setMessageSent(false)}
                maxLength={LONG_TEXT_LENGTH}
              />
              <Caption>{t('share-dialog.warning')}</Caption>
            </DialogContent>
            <DialogActions>
              {isMessageSent && (
                <Alert severity="info" sx={{ marginRight: 'auto' }}>
                  {t('messaging.successfully-sent')}
                </Alert>
              )}
              <SendButton loading={isLoading} disabled={!isValid} onClick={() => handleSubmit()} />
            </DialogActions>
          </>
        )}
      </Formik>
    </DialogWithGrid>
  );
};
