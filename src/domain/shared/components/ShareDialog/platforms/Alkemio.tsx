import { FC, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { Box, Button } from '@mui/material';
import FormikInputField from '../../../../../common/components/composite/forms/FormikInputField';
import { FormikUserSelector } from '../../../../../common/components/composite/forms/FormikUserSelector';
import { gutters } from '../../../../../core/ui/grid/utils';
import { Caption, Text } from '../../../../../core/ui/typography';
import { ShareButton, ShareOnPlatformButtonProps, ShareOnPlatformHandlerProps } from '../AdvancedShareDialog';
import { LONG_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';

interface ShareOnAlkemioData {
  url: string;
  userIds: string[];
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
>(({ url, goBack, closeDialog }) => {
  const { t } = useTranslation();
  const initialValues: ShareOnAlkemioData = {
    url,
    message: '',
    userIds: [],
  };

  const validationSchema = yup.object().shape({
    url: yup.string().required(t('forms.validations.required')),
    //message: yup.string().required(t('forms.validations.required'))
  });

  const onSubmit = (x?, y?, z?) => {
    console.log(x, y, z);
  };

  return (
    <Box>
      <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
        {({ handleSubmit }) => {
          return (
            <Form noValidate onSubmit={handleSubmit} autoComplete="off">
              <Text mb={gutters(1)}>{t('share-dialog.platforms.alkemio.description')}</Text>
              <FormikUserSelector name="users" />
              <FormikInputField
                name="message"
                title={t('share-dialog.message-optional')}
                placeholder={t('share-dialog.message-optional')}
                multiline
                rows={5}
                withCounter
                maxLength={LONG_TEXT_LENGTH}
              />
              <Caption>{t('share-dialog.warning')}</Caption>

              <Button onClick={() => handleSubmit()} type="submit">
                Submit
              </Button>
              <Button onClick={goBack}>Back</Button>
              <Button onClick={closeDialog}>close</Button>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
});
