import { useTranslation } from 'react-i18next';
import { InviteContributorsDialogProps } from '../InviteContributorsProps';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useSpace } from '@/domain/space/context/useSpace';
import { Button, DialogActions } from '@mui/material';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  ContributorSelectorType,
  SelectedContributor,
} from '../components/FormikContributorsSelectorField/FormikContributorsSelectorField.models';
import { SelectedContributorSchema } from '../components/FormikContributorsSelectorField/FormikContributorsSelectorField.validation';
import SendButton from '@/core/ui/actions/SendButton';
import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { compact } from 'lodash';
import { useState } from 'react';
import InvitationResultModel from '@/domain/access/model/InvitationResultModel';
import InvitationsResultDialogContent from './InvitationsResultDialogContent';
import InviteUsersFormDialogContent from './InviteUsersFormDialogContent';

export const INVITE_USERS_TO_ROLES = [RoleName.Member, RoleName.Lead, RoleName.Admin] as const;

type InviteUsersData = {
  welcomeMessage: string;
  selectedContributors: SelectedContributor[];
  extraRole: RoleName;
};

const InviteUsersDialog = ({ open, onClose }: InviteContributorsDialogProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const [invitationsResults, setInvitationSent] = useState<InvitationResultModel[] | undefined>(undefined);
  const {
    space: {
      about: {
        profile: { displayName: spaceName },
        membership,
      },
    },
    loading: spaceLoading,
  } = useSpace();
  const roleSetId = membership?.roleSetID;
  const { inviteContributorsOnRoleSet, loading: loadingRoleSet } = useRoleSetApplicationsAndInvitations({ roleSetId });

  const validationSchema = yup.object().shape({
    welcomeMessage: yup.string().required(),
    selectedContributors: yup.array().of(SelectedContributorSchema).required(),
    extraRole: yup.string().oneOf(INVITE_USERS_TO_ROLES).required(),
  });

  const initialValues: InviteUsersData = {
    welcomeMessage: t('community.invitations.inviteContributorsDialog.users.defaultWelcomeMessage'),
    selectedContributors: [],
    extraRole: RoleName.Member,
  };

  const [onSubmit, invitingUsers] = useLoadingState(async (data: InviteUsersData) => {
    const requiredRoleSetId = ensurePresence(roleSetId);
    const invitedContributorIds = compact(
      data.selectedContributors.map(contributor =>
        contributor.type === ContributorSelectorType.User ? contributor.id : undefined
      )
    );
    const invitedUserEmails = compact(
      data.selectedContributors.map(contributor =>
        contributor.type === ContributorSelectorType.Email ? contributor.email : undefined
      )
    );
    const result = await inviteContributorsOnRoleSet({
      roleSetId: requiredRoleSetId,
      invitedContributorIds,
      invitedUserEmails,
      welcomeMessage: data.welcomeMessage,
      extraRole: data.extraRole,
    });
    setInvitationSent(result);
  });

  const loading = spaceLoading || loadingRoleSet || invitingUsers;

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogHeader
        title={t('community.invitations.inviteContributorsDialog.users.title', { spaceName })}
        onClose={onClose}
      />
      <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
        {({ handleSubmit, isValid, setFieldValue }) => (
          <>
            {!invitationsResults && (
              <>
                <InviteUsersFormDialogContent />
                <DialogActions>
                  <SendButton loading={loading} disabled={!isValid} onClick={() => handleSubmit()} />
                </DialogActions>
              </>
            )}
            {invitationsResults && (
              <>
                <InvitationsResultDialogContent invitationsResults={invitationsResults} />
                <DialogActions>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setFieldValue('selectedContributors', []);
                      setInvitationSent(undefined);
                    }}
                  >
                    {t('community.invitations.inviteContributorsDialog.users.back')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setFieldValue('selectedContributors', []);
                      setInvitationSent(undefined);
                      onClose();
                    }}
                  >
                    {t('buttons.close')}
                  </Button>
                </DialogActions>
              </>
            )}
          </>
        )}
      </Formik>
    </DialogWithGrid>
  );
};

export default InviteUsersDialog;
