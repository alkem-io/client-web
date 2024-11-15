import React, { ReactNode, useState } from 'react';
import { Alert, Dialog, DialogActions } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import useLoadingState from '../../shared/utils/useLoadingState';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle, Caption, Text } from '@/core/ui/typography';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import SendButton from '../../shared/components/SendButton';
import Gutters from '@/core/ui/grid/Gutters';
import { InviteExternalUserData } from './useInviteUsers';
import { CommunityRoleType } from '@/core/apollo/generated/graphql-schema';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

interface MessageDialogProps {
  open: boolean;
  spaceDisplayName: string;
  onClose: () => void;
  onInviteUser: (params: InviteExternalUserData) => Promise<void>;
  title?: ReactNode;
  subtitle?: ReactNode;
  communityRoles: readonly CommunityRoleType[];
}

const InviteExternalUserDialog = ({
  open,
  onClose,
  onInviteUser,
  title,
  subtitle,
  spaceDisplayName,
  communityRoles,
}: MessageDialogProps) => {
  const { t } = useTranslation();

  const [isMessageSent, setMessageSent] = useState(false);

  const [handleSendMessage, isLoading, error] = useLoadingState(
    async (values: InviteExternalUserData, formikHelpers: FormikHelpers<InviteExternalUserData>) => {
      try {
        await onInviteUser(values);

        if (!error) {
          setMessageSent(true);
          formikHelpers.resetForm();
        }
      } catch (err) {
        console.error(err);
      }
    }
  );

  const handleClose = () => {
    onClose();
    setMessageSent(false);
  };

  const validationSchema = yup.object().shape({
    message: yup.string(),
    email: yup.string().required(),
  });

  const initialValues: InviteExternalUserData = {
    email: '',
    extraRole: CommunityRoleType.Member,
    message: t('components.invitations.defaultInvitationMessage', { space: spaceDisplayName }) as string,
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogHeader onClose={handleClose}>
        <BlockTitle>{title}</BlockTitle>
      </DialogHeader>
      <Gutters paddingTop={subtitle ? 0 : undefined}>
        {subtitle && <Text>{subtitle}</Text>}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSendMessage}
        >
          {({ handleSubmit, isValid }) => (
            <Form noValidate autoComplete="off">
              <Gutters disablePadding>
                <Gutters disablePadding flexDirection={{ xs: 'column', sm: 'row' }} alignItems={'flex-start'}>
                  <Gutters disablePadding flexGrow={1}>
                    <FormikInputField name="email" title={t('common.email')} placeholder={t('common.email')} />
                  </Gutters>
                  {communityRoles.length > 0 && (
                    <Gutters disablePadding row alignItems={'center'}>
                      <Caption style={{ whiteSpace: 'nowrap' }}>{t('components.invitations.inviteToRole')}</Caption>
                      <Gutters disableGap disablePadding sx={{ minWidth: '100px' }}>
                        <FormikSelect
                          name="extraRole"
                          values={communityRoles.map(role => ({
                            id: role,
                            name: t(`common.${role.toLowerCase()}` as TranslationKey, { defaultValue: role }) as string,
                          }))}
                          required
                        />
                      </Gutters>
                    </Gutters>
                  )}
                </Gutters>
                <FormikInputField
                  name="message"
                  title={t('messaging.message')}
                  placeholder={t('messaging.message')}
                  multiline
                  rows={5}
                  onFocus={() => setMessageSent(false)}
                  maxLength={LONG_TEXT_LENGTH}
                />
              </Gutters>
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
      </Gutters>
    </Dialog>
  );
};

export default InviteExternalUserDialog;
