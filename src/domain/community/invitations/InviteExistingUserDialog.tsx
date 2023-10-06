import React, { ReactNode, useCallback, useState } from 'react';
import { Alert, Dialog, DialogActions } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import useLoadingState from '../../shared/utils/useLoadingState';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import { BlockTitle, Caption, Text } from '../../../core/ui/typography';
import FormikInputField from '../../../core/ui/forms/FormikInputField/FormikInputField';
import { LONG_TEXT_LENGTH } from '../../../core/ui/forms/field-length.constants';
import SendButton from '../../shared/components/SendButton';
import Gutters from '../../../core/ui/grid/Gutters';
import { FormikUserSelector } from '../user/FormikUserSelector/FormikUserSelector';
import { InviteExistingUserData } from './useInviteUsers';
import { Identifiable } from '../../../core/utils/Identifiable';

interface MessageDialogProps {
  open: boolean;
  spaceDisplayName: string;
  onClose: () => void;
  onInviteUser: (params: InviteExistingUserData) => Promise<void>;
  title?: ReactNode;
  subtitle?: ReactNode;
  currentApplicationsUserIds: string[];
  currentInvitationsUserIds: string[];
  currentMembersIds: string[];
}

const InviteExistingUserDialog = ({
  open,
  onClose,
  onInviteUser,
  title,
  subtitle,
  spaceDisplayName,
  currentApplicationsUserIds,
  currentInvitationsUserIds,
  currentMembersIds,
}: MessageDialogProps) => {
  const { t } = useTranslation();

  const [isMessageSent, setMessageSent] = useState(false);

  const [handleSendMessage, isLoading, error] = useLoadingState(
    async (values: InviteExistingUserData, { resetForm }: FormikHelpers<InviteExistingUserData>) => {
      await onInviteUser(values);
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
    message: yup.string(),
    userIds: yup.array().required(),
  });

  const initialValues: InviteExistingUserData = {
    userIds: [],
    message: t('components.invitations.defaultInvitationMessage', { space: spaceDisplayName }) as string,
  };

  const usersSorting = useCallback(
    <T extends Identifiable>(users: T[]) => {
      return users.sort((a, b) => {
        const [aHasApplication, bHasApplication, aHasInvitation, bHasInvitation, aIsMember, bIsMember] = [
          currentApplicationsUserIds.includes(a.id),
          currentApplicationsUserIds.includes(b.id),
          currentInvitationsUserIds.includes(a.id),
          currentInvitationsUserIds.includes(b.id),
          currentMembersIds.includes(a.id),
          currentMembersIds.includes(b.id),
        ];

        if (aHasApplication !== bHasApplication) {
          return aHasApplication && !bHasApplication ? 1 : -1;
        }
        if (aHasInvitation !== bHasInvitation) {
          return aHasInvitation && !bHasInvitation ? 1 : -1;
        }
        if (aIsMember !== bIsMember) {
          return aIsMember && !bIsMember ? 1 : -1;
        }
        return 0;
      });
    },
    [currentApplicationsUserIds, currentInvitationsUserIds, currentMembersIds]
  );

  const usersExpander = useCallback(
    <T extends Identifiable>(users: T[]) => {
      const alreadyAppliedTranslation = t('components.invitations.inviteExistingUserDialog.selector.alreadyApplied');
      const alreadyInvitedTranslation = t('components.invitations.inviteExistingUserDialog.selector.alreadyInvited');
      const alreadyMemberTranslation = t('components.invitations.inviteExistingUserDialog.selector.alreadyMember');

      return users.map(user => {
        const hasApplication = currentApplicationsUserIds.includes(user.id);
        const hasInvitation = currentInvitationsUserIds.includes(user.id);
        const isMember = currentMembersIds.includes(user.id);
        return {
          ...user,
          message: hasApplication
            ? alreadyAppliedTranslation
            : hasInvitation
            ? alreadyInvitedTranslation
            : isMember
            ? alreadyMemberTranslation
            : undefined,
          disabled: hasApplication || hasInvitation || isMember,
        };
      });
    },
    [currentApplicationsUserIds, currentInvitationsUserIds, currentMembersIds]
  );

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
              <FormikUserSelector name="userIds" resultsSorter={usersSorting} resultsExpander={usersExpander} />
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

export default InviteExistingUserDialog;
