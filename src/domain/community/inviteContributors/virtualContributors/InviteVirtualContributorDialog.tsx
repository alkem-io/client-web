import { Dialog, DialogActions } from '@mui/material';
import { Form, Formik } from 'formik';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useVirtualContributorProfileQuery } from '@/core/apollo/generated/apollo-hooks';
import SendButton from '@/core/ui/actions/SendButton';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import GridContainer from '@/core/ui/grid/GridContainer';
import { useColumns } from '@/core/ui/grid/GridContext';
import GridProvider from '@/core/ui/grid/GridProvider';
import Gutters from '@/core/ui/grid/Gutters';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { BlockTitle, Caption, Text } from '@/core/ui/typography';
import type { InviteContributorsData } from '@/domain/access/model/InvitationDataModel';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { ProfileChip } from '../../contributor/ProfileChip/ProfileChip';

type MessageDialogProps = {
  open: boolean;
  spaceDisplayName: string;
  onClose: () => void;
  onInviteVirtualContributor: (params: InviteContributorsData) => Promise<unknown>;
  title?: ReactNode;
  subtitle?: ReactNode;
  contributorId: string;
};

const InviteVirtualContributorDialog = ({
  open,
  onClose,
  onInviteVirtualContributor,
  title,
  subtitle,
  spaceDisplayName,
  contributorId,
}: MessageDialogProps) => {
  const { t } = useTranslation();

  const notify = useNotification();

  const columns = useColumns();

  const { data: vcProfile } = useVirtualContributorProfileQuery({
    variables: {
      id: contributorId,
    },
    skip: !contributorId,
  });

  const [handleSendMessage, isLoading, error] = useLoadingState(async (values: InviteContributorsData) => {
    await onInviteVirtualContributor({ ...values, invitedActorIds: [contributorId] });
    if (!error) {
      notify(t('community.invitations.inviteContributorsDialog.vcs.invitationSent'), 'success');
      onClose();
    }
  });

  const validationSchema = yup.object().shape({
    welcomeMessage: textLengthValidator(),
  });

  const initialValues: InviteContributorsData = {
    welcomeMessage: t('community.invitations.inviteContributorsDialog.vcs.defaultVCInvitationMessage', {
      space: spaceDisplayName,
      name: vcProfile?.lookup.virtualContributor?.profile?.displayName ?? '',
    }) as string,
    invitedUserEmails: [],
    invitedActorIds: [],
  };

  return (
    <Dialog open={open} fullWidth={true} maxWidth="md">
      <DialogHeader onClose={onClose}>
        <BlockTitle>{title}</BlockTitle>
      </DialogHeader>
      <Gutters paddingTop={0}>
        {subtitle && <Text>{subtitle}</Text>}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={handleSendMessage}
        >
          {({ handleSubmit, isValid }) => (
            <Form noValidate={true} autoComplete="off">
              <GridContainer paddingLeft={0}>
                <GridProvider columns={columns}>
                  <ProfileChip
                    displayName={vcProfile?.lookup.virtualContributor?.profile?.displayName ?? ''}
                    avatarUrl={vcProfile?.lookup.virtualContributor?.profile?.avatar?.uri ?? ''}
                  />
                </GridProvider>
              </GridContainer>
              <FormikInputField
                name="welcomeMessage"
                title={t('messaging.message')}
                placeholder={t('messaging.message')}
                multiline={true}
                rows={5}
                maxLength={LONG_TEXT_LENGTH}
              />
              <Caption>{t('share-dialog.warning')}</Caption>
              <DialogActions sx={{ paddingX: 0 }}>
                <SendButton loading={isLoading} disabled={!isValid} onClick={() => handleSubmit()} />
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Gutters>
    </Dialog>
  );
};

export default InviteVirtualContributorDialog;
