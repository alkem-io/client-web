import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { Alert, Box, Button, DialogActions } from '@mui/material';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { FormikUserSelector } from '@/domain/community/user/FormikUserSelector/FormikUserSelector';
import { gutters } from '@/core/ui/grid/utils';
import { Caption, Text } from '@/core/ui/typography';
import { ShareButton, ShareOnPlatformButtonProps, ShareOnPlatformHandlerProps } from '../ShareDialog';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import SendButton from '@/core/ui/actions/SendButton';
import { useShareLinkWithUserMutation } from '@/core/apollo/generated/apollo-hooks';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

const ICON_URL = '/share-dialog/alkemio.png';

interface ShareOnAlkemioData {
  url: string;
  users: string[];
  message: string;
}

export const ShareOnAlkemioButton: FC<ShareOnPlatformButtonProps> = ({ setShareHandler, ...props }) => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    setShareHandler('alkemio');
  }, [setShareHandler]);

  return (
    <ShareButton
      startIcon={<Box component="img" src={ICON_URL} />}
      color="primary"
      variant="contained"
      onClick={handleClick}
      {...props}
    >
      {t('share-dialog.platforms.alkemio.title')}
    </ShareButton>
  );
};

export const AlkemioShareHandler: FC<ShareOnPlatformHandlerProps> = props => {
  const { t } = useTranslation();

  const { entityTypeName, url, goBack } = props || {};

  const [isMessageSent, setMessageSent] = useState(false);

  const initialValues: ShareOnAlkemioData = useMemo(
    () => ({
      url,
      message: t('share-dialog.platforms.alkemio.default-template', {
        url,
        entity: t(`common.${entityTypeName}` as const),
      }),
      users: [],
    }),
    [entityTypeName, t, url]
  );

  const validationSchema = yup.object().shape({
    url: textLengthValidator({ required: true }),
    message: yup
      .string()
      .required(t('forms.validations.required'))
      .max(LONG_TEXT_LENGTH, t('forms.validations.maxLength', { max: LONG_TEXT_LENGTH })),
    users: yup.array().min(1, t('forms.validations.atLeastOne', { item: t('common.user') })),
  });

  const [shareLinkMutation, { loading, error }] = useShareLinkWithUserMutation();
  const shareLink = useCallback(
    async (receiverIds: string[], url: string, message: string) => {
      // Make sure the message includes the link, if not, append it to the end:
      // TODO: With a proper notification template for sharing entities this shouldn't be needed
      if (message.indexOf(url) === -1) {
        message = `${message}\n\n${url}`;
      }

      await shareLinkMutation({
        variables: {
          messageData: {
            receiverIds,
            message,
          },
        },
      });
    },
    [shareLinkMutation]
  );

  const onSubmit = async (values: ShareOnAlkemioData, { resetForm }) => {
    await shareLink(values.users, values.url, values.message);
    if (!error) {
      setMessageSent(true);
      resetForm();
    }
  };

  const handleSetMessageFalse = () => setMessageSent(false);

  return (
    <Box>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize>
        {({ handleSubmit, isValid }) => (
          <Form noValidate autoComplete="off">
            <Text marginBottom={gutters(1)}>
              {t('share-dialog.platforms.alkemio.description', { entity: t(`common.${entityTypeName}` as const) })}
            </Text>

            <FormikUserSelector name="users" onChange={handleSetMessageFalse} />

            <FormikInputField
              name="message"
              title={t('messaging.message-optional')}
              placeholder={t('messaging.message-optional')}
              multiline
              rows={5}
              onFocus={handleSetMessageFalse}
              maxLength={LONG_TEXT_LENGTH}
            />

            <Caption>{t('share-dialog.warning')}</Caption>

            <DialogActions sx={{ paddingX: 0 }}>
              {isMessageSent && (
                <Alert severity="info" sx={{ marginRight: 'auto' }}>
                  {t('messaging.successfully-sent')}
                </Alert>
              )}
              <Button onClick={goBack}>Back</Button>
              <SendButton loading={loading} disabled={!isValid} onClick={() => handleSubmit()} />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Box>
  );
};
