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
import { InviteContributorsData } from './useInviteUsers';
import { Identifiable } from '../../../core/utils/Identifiable';
import { sortBy } from 'lodash';

interface MessageDialogProps {
  open: boolean;
  spaceDisplayName: string;
  onClose: () => void;
  onInviteUser: (params: InviteContributorsData) => Promise<void>;
  title?: ReactNode;
  subtitle?: ReactNode;
  currentApplicationsUserIds: string[];
  currentInvitationsUserIds: string[];
  currentMembersIds: string[];
}

enum SortCriteria {
  HasApplication,
  HasInvitation,
  IsMember,
}

const SORT_CRITERIA_PRIORITY = [SortCriteria.HasApplication, SortCriteria.HasInvitation, SortCriteria.IsMember];

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
    async (values: InviteContributorsData, { resetForm }: FormikHelpers<InviteContributorsData>) => {
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
    contributorIds: yup.array().required(),
  });

  const initialValues: InviteContributorsData = {
    contributorIds: [],
    message: t('components.invitations.defaultInvitationMessage', { space: spaceDisplayName }) as string,
  };

  const getSortFact: Record<SortCriteria, ({ id }: Identifiable) => boolean> = {
    [SortCriteria.HasApplication]: ({ id }) => currentApplicationsUserIds.includes(id),
    [SortCriteria.HasInvitation]: ({ id }) => currentInvitationsUserIds.includes(id),
    [SortCriteria.IsMember]: ({ id }) => currentMembersIds.includes(id),
  };

  const sortUsers = useCallback(
    <T extends Identifiable>(users: T[]) => {
      return sortBy(users, user => {
        return SORT_CRITERIA_PRIORITY.reduce<number>((totalWeight, criteria, priority) => {
          const weight = getSortFact[criteria](user) ? Math.pow(2, priority) : 0;
          return totalWeight + weight;
        }, 0);
      });
    },
    [currentApplicationsUserIds, currentInvitationsUserIds, currentMembersIds]
  );

  const alreadyAppliedTranslation = t('components.invitations.inviteExistingUserDialog.selector.alreadyApplied');
  const alreadyInvitedTranslation = t('components.invitations.inviteExistingUserDialog.selector.alreadyInvited');
  const alreadyMemberTranslation = t('components.invitations.inviteExistingUserDialog.selector.alreadyMember');

  const hydrateUsers = useCallback(
    <T extends Identifiable>(users: T[]) => {
      return users.map(user => {
        const hasApplication = currentApplicationsUserIds.includes(user.id);
        const hasInvitation = currentInvitationsUserIds.includes(user.id);
        const isMember = currentMembersIds.includes(user.id);
        const hasMembershipLike = hasApplication || hasInvitation || isMember;

        if (!hasMembershipLike) {
          return user;
        }

        return {
          ...user,
          message: hasApplication
            ? alreadyAppliedTranslation
            : hasInvitation
            ? alreadyInvitedTranslation
            : isMember
            ? alreadyMemberTranslation
            : undefined,
          disabled: hasMembershipLike,
        };
      });
    },
    [
      currentApplicationsUserIds,
      currentInvitationsUserIds,
      currentMembersIds,
      alreadyAppliedTranslation,
      alreadyInvitedTranslation,
      alreadyMemberTranslation,
    ]
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
              <FormikUserSelector name="contributorIds" sortUsers={sortUsers} hydrateUsers={hydrateUsers} />
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
