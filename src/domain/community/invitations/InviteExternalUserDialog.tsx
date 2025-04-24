import { ReactNode, useState } from 'react';
import { Alert, Dialog, DialogActions } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle, Caption, Text } from '@/core/ui/typography';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import SendButton from '@/core/ui/actions/SendButton';
import Gutters from '@/core/ui/grid/Gutters';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { InviteContributorsData } from '@/domain/access/model/InvitationDataModel';

type MessageDialogProps = {
  open: boolean;
  spaceDisplayName: string;
  onClose: () => void;
  onInviteUser: (params: InviteContributorsData) => Promise<unknown>;
  title?: ReactNode;
  subtitle?: ReactNode;
  communityRoles: readonly RoleName[];
};

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

  const [isInvitationSent, setInvitationSent] = useState(false);

  const [handleSendInvitation, isLoading, error] = useLoadingState(
    async (values: InviteContributorsDataTemp, formikHelpers: FormikHelpers<InviteContributorsDataTemp>) => {
      try {
        await onInviteUser({ ...values, invitedUserEmails: [values.email] });

        if (!error) {
          setInvitationSent(true);
          formikHelpers.resetForm();
        }
      } catch (err) {
        console.error(err);
      }
    }
  );

  const handleClose = () => {
    onClose();
    setInvitationSent(false);
  };

  const validationSchema = yup.object().shape({
    welcomeMessage: yup.string(),
    email: yup.string().required(),
  });

  // Todo: remove this when we have a better way to handle the form
  type InviteContributorsDataTemp = InviteContributorsData & {
    email: string;
  };

  const initialValues: InviteContributorsDataTemp = {
    email: '',
    invitedUserEmails: [],
    invitedContributorIds: [],
    extraRole: RoleName.Member,
    welcomeMessage: t('components.invitations.defaultInvitationMessage', { space: spaceDisplayName }) as string,
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
          onSubmit={handleSendInvitation}
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
                  name="welcomeMessage"
                  title={t('messaging.message')}
                  placeholder={t('messaging.message')}
                  multiline
                  rows={5}
                  onFocus={() => setInvitationSent(false)}
                  maxLength={LONG_TEXT_LENGTH}
                />
              </Gutters>
              <Caption>{t('share-dialog.warning')}</Caption>
              <DialogActions sx={{ paddingX: 0 }}>
                {isInvitationSent && (
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
