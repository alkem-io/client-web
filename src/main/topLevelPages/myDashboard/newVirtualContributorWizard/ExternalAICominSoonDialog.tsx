import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Box, Button, DialogContent, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../../core/ui/grid/Gutters';
import { Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import { Actions } from '../../../../core/ui/actions/Actions';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { MessageWithPayload } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import { MID_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSendMessageToUserMutation, useUserSelectorQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../../domain/community/user';
import { UserFilterInput } from '../../../../core/apollo/generated/graphql-schema';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { warn as logWarn } from '../../../../core/logging/sentry/log';

const SUPPORT_EMAIL = 'support@alkem.io';

interface ExternalAIComingSoonDialogProps {
  open: boolean;
  onClose: () => void;
}

const enum ContactOptions {
  option1 = 'Yes',
  option2 = 'No',
}

interface FormValues {
  aiService: string;
  sendResponse: string;
}

const ExternalAIComingSoonDialog: React.FC<ExternalAIComingSoonDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  const { user } = useUserContext();

  const [sendMessageToUser] = useSendMessageToUserMutation();

  const initialValues: FormValues = {
    aiService: '',
    sendResponse: ContactOptions.option1,
  };

  const validationSchema = yup.object().shape({
    aiService: yup
      .string()
      .required()
      .min(3, MessageWithPayload('forms.validations.minLength'))
      .max(MID_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
  });

  const filter: UserFilterInput = { email: SUPPORT_EMAIL };

  const { data: userData } = useUserSelectorQuery({
    variables: { filter, first: 1 },
  });

  const sendNotification = async (values: FormValues) => {
    setLoading(true);

    if (userData?.usersPaginated.users[0]?.id) {
      try {
        await sendMessageToUser({
          variables: {
            messageData: {
              message: `AI Service: "${values.aiService.trim()}" | User: ${user?.user.email} | Contact me: ${
                values.sendResponse
              }.`,
              receiverIds: [userData?.usersPaginated.users[0].id],
            },
          },
        });

        notify(t('createVirtualContributorWizard.externalAICommingSoon.success'), 'success');
      } finally {
        setLoading(false);
        onClose();
      }
    } else {
      // email not configured but there's no need of UI error message
      logWarn(
        `User tried to send an externa AI request "${values.aiService.trim()}" | User: ${
          user?.user.email
        } | Contact me: ${values.sendResponse}" but there's no support email configured.`,
        { code: 'NoSupportEmailConfigured' }
      );

      setLoading(false);
      onClose();
    }
  };

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={8}>
      <DialogHeader title={t('createVirtualContributorWizard.externalAICommingSoon.title')} onClose={onClose} />
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          validateOnMount
          onSubmit={(values: FormValues) => sendNotification(values)}
        >
          {({ isValid, handleChange }) => (
            <Form>
              <Gutters disablePadding>
                <Box display="flex" gap={gutters(0.5)}>
                  <Caption alignSelf="center">
                    {t('createVirtualContributorWizard.externalAICommingSoon.subTitle')}
                  </Caption>
                </Box>
                <FormikInputField
                  name="aiService"
                  title={t('createVirtualContributorWizard.externalAICommingSoon.input.label')}
                  placeholder={t('createVirtualContributorWizard.externalAICommingSoon.input.placeholder')}
                />
                <Box display="flex" gap={gutters(0.5)}>
                  <Caption alignSelf="center">
                    {t('createVirtualContributorWizard.externalAICommingSoon.contactOptions.title')}
                  </Caption>
                </Box>
                <Field component={RadioGroup} name="sendResponse" onChange={handleChange}>
                  <FormControlLabel
                    value={ContactOptions.option1}
                    control={<Radio disabled={loading} />}
                    label={t('createVirtualContributorWizard.externalAICommingSoon.contactOptions.option1')}
                  />
                  <FormControlLabel
                    value={ContactOptions.option2}
                    control={<Radio disabled={loading} />}
                    label={t('createVirtualContributorWizard.externalAICommingSoon.contactOptions.option2')}
                  />
                </Field>
                <Actions justifyContent="end">
                  <Button variant="text" onClick={onClose}>
                    {t('buttons.back')}
                  </Button>
                  <LoadingButton variant="contained" disabled={!isValid || loading} loading={loading} type="submit">
                    {t('buttons.send')}
                  </LoadingButton>
                </Actions>
              </Gutters>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default ExternalAIComingSoonDialog;
