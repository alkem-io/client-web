import { Alert, DialogActions, DialogContent } from '@mui/material';
import { Formik, type FormikState } from 'formik';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import SendButton from '@/core/ui/actions/SendButton';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import GridContainer from '@/core/ui/grid/GridContainer';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography/components';
import { ProfileChip } from '@/domain/community/contributor/ProfileChip/ProfileChip';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

export interface MessageReceiverChipData {
  id: string;
  displayName?: string;
  city?: string;
  country?: string;
  avatarUri?: string;
}

type MessageUserDialogProps = {
  open: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<void>;
  messageReceivers?: MessageReceiverChipData[];
  title?: ReactNode;
};

type SendMessageData = {
  message: string;
};

/**
 * Consider using useDirectMessageDialog hook that has Send Message mutations baked in.
 */
export const DirectMessageDialog = ({
  open,
  onClose,
  onSendMessage,
  messageReceivers,
  title,
}: MessageUserDialogProps) => {
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
    message: textLengthValidator({ required: true }),
  });

  const initialValues: SendMessageData = {
    message: '',
  };

  return (
    <DialogWithGrid
      columns={12}
      open={open}
      fullWidth={true}
      maxWidth="md"
      aria-labelledby="direct-message-dialog"
      onClose={handleClose}
    >
      <DialogHeader id="direct-message-dialog" title={title} onClose={handleClose} />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={handleSendMessage}
      >
        {({ handleSubmit, isValid }) => (
          <>
            <DialogContent>
              <GridContainer disablePadding={true} marginBottom={gutters(1)}>
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
                multiline={true}
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
