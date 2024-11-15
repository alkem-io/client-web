import React, { ReactNode } from 'react';
import { Dialog, DialogActions } from '@mui/material';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import useLoadingState from '../../shared/utils/useLoadingState';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle, Caption, Text } from '@/core/ui/typography';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import SendButton from '../../shared/components/SendButton';
import Gutters from '@/core/ui/grid/Gutters';
import { InviteContributorsData, InviteUserData } from './useInviteUsers';
import GridContainer from '@/core/ui/grid/GridContainer';
import GridProvider from '@/core/ui/grid/GridProvider';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useVirtualContributorProfileQuery } from '@/core/apollo/generated/apollo-hooks';
import { ProfileChip } from '../contributor/ProfileChip/ProfileChip';
import { useColumns } from '@/core/ui/grid/GridContext';

interface MessageDialogProps {
  open: boolean;
  spaceDisplayName: string;
  onClose: () => void;
  onInviteUser: (params: InviteContributorsData) => Promise<void>;
  title?: ReactNode;
  subtitle?: ReactNode;
  contributorId: string;
}

const InviteVirtualContributorDialog = ({
  open,
  onClose,
  onInviteUser,
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

  const [handleSendMessage, isLoading, error] = useLoadingState(async (values: InviteUserData) => {
    await onInviteUser({ ...values, contributorIds: [contributorId] });
    if (!error) {
      notify(t('community.invitationSent'), 'success');
      onClose();
    }
  });

  const validationSchema = yup.object().shape({
    message: yup.string(),
  });

  const initialValues: InviteUserData = {
    message: t('components.invitations.defaultVCInvitationMessage', {
      space: spaceDisplayName,
      name: vcProfile?.virtualContributor?.profile.displayName ?? '',
    }) as string,
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogHeader onClose={onClose}>
        <BlockTitle>{title}</BlockTitle>
      </DialogHeader>
      <Gutters paddingTop={0}>
        {subtitle && <Text>{subtitle}</Text>}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSendMessage}
        >
          {({ handleSubmit, isValid }) => (
            <Form noValidate autoComplete="off">
              <GridContainer paddingLeft={0}>
                <GridProvider columns={columns}>
                  <ProfileChip
                    displayName={vcProfile?.virtualContributor?.profile.displayName ?? ''}
                    avatarUrl={vcProfile?.virtualContributor?.profile.avatar?.uri ?? ''}
                  />
                </GridProvider>
              </GridContainer>
              <FormikInputField
                name="message"
                title={t('messaging.message')}
                placeholder={t('messaging.message')}
                multiline
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
