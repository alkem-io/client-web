import { FC, forwardRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { Alert, Box, Button, DialogActions } from '@mui/material';
import FormikInputField from '../../../../../common/components/composite/forms/FormikInputField';
import { FormikUserSelector } from '../../../../community/contributor/user/FormikUserSelector/FormikUserSelector';
import { gutters } from '../../../../../core/ui/grid/utils';
import { Caption, Text } from '../../../../../core/ui/typography';
import { ShareButton, ShareOnPlatformButtonProps, ShareOnPlatformHandlerProps } from '../AdvancedShareDialog';
import { LONG_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import SendButton from '../../SendButton';
import { useShareLinkWithUserMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useApolloErrorHandler } from '../../../../../core/apollo/hooks/useApolloErrorHandler';

interface ShareOnAlkemioData {
  url: string;
  users: string[];
  message: string;
}

export const ShareOnAlkemioButton: FC<ShareOnPlatformButtonProps> = ({ setShareHandler, ...props }) => {
  const { t } = useTranslation();
  const ICON_URL = '/share-dialog/alkemio.png';

  return (
    <ShareButton
      startIcon={<Box component="img" src={ICON_URL} />}
      color="primary"
      variant="contained"
      onClick={() => setShareHandler(AlkemioShareHandler)}
      {...props}
    >
      {t('share-dialog.platforms.alkemio.title')}
    </ShareButton>
  );
};

const AlkemioShareHandler: FC<ShareOnPlatformHandlerProps> = forwardRef<
  HTMLDivElement | null,
  ShareOnPlatformHandlerProps
>(({ entityTypeName, url, goBack }, _ref) => {
  const { t } = useTranslation();
  const handleError = useApolloErrorHandler();

  const initialValues: ShareOnAlkemioData = {
    url,
    message: t('share-dialog.platforms.alkemio.default-template', {
      url,
      entity: t(`common.${entityTypeName}` as const),
      interpolation: {
        escapeValue: false,
      },
    }),
    users: [],
  };

  const validationSchema = yup.object().shape({
    url: yup.string().required(t('forms.validations.required')),
    users: yup.array().min(1, t('forms.validations.at-least-one', { item: t('common.user') })),
  });

  const [shareLinkMutation, { loading, error }] = useShareLinkWithUserMutation({
    onError: handleError,
  });
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
  const [isMessageSent, setMessageSent] = useState(false);

  return (
    <Box>
      <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
        {({ handleSubmit, isValid }) => (
          <Form noValidate autoComplete="off">
            <Text mb={gutters(1)}>
              {t('share-dialog.platforms.alkemio.description', { entity: t(`common.${entityTypeName}` as const) })}
            </Text>

            <FormikUserSelector name="users" onChange={() => setMessageSent(false)} />

            <FormikInputField
              name="message"
              title={t('messaging.message-optional')}
              placeholder={t('messaging.message-optional')}
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
              <Button onClick={goBack}>Back</Button>
              <SendButton loading={loading} disabled={!isValid} onClick={() => handleSubmit()} />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Box>
  );
});
