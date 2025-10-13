import { useTranslation } from 'react-i18next';
import { InviteContributorsDialogProps } from '../InviteContributorsProps';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Button, DialogActions } from '@mui/material';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  ContributorSelectorType,
  SelectedContributor,
} from '../components/FormikContributorsSelectorField/FormikContributorsSelectorField.models';
import { SelectedContributorsArraySchema } from '../components/FormikContributorsSelectorField/FormikContributorsSelectorField.validation';
import SendButton from '@/core/ui/actions/SendButton';
import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { compact } from 'lodash';
import { useState } from 'react';
import InvitationResultModel from '@/domain/access/model/InvitationResultModel';
import InvitationsResultDialogContent from './InvitationsResultDialogContent';
import InviteUsersFormDialogContent from './InviteUsersFormDialogContent';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useInviteUsersDialogQuery } from '@/core/apollo/generated/apollo-hooks';
import { Caption } from '@/core/ui/typography';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

export const INVITE_USERS_TO_ROLES = [RoleName.Member, RoleName.Lead, RoleName.Admin] as const;

type InviteUsersData = {
  welcomeMessage: string;
  selectedContributors: SelectedContributor[];
  extraRoles: RoleName[];
};

const InviteUsersDialog = ({
  open,
  onClose,
  filterContributors,
  onlyFromParentCommunity,
}: InviteContributorsDialogProps) => {
  const { t } = useTranslation();
  const { spaceId, loading: resolvingSpace, parentSpaceId } = useUrlResolver();
  const { data, loading: loadingSpace } = useInviteUsersDialogQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !open || !spaceId,
  });

  const spaceName = data?.lookup.space?.about.profile.displayName;
  const roleSetId = data?.lookup.space?.about.membership.roleSetID;

  const ensurePresence = useEnsurePresence();
  const [invitationsResults, setInvitationSent] = useState<InvitationResultModel[] | undefined>(undefined);

  const { inviteContributorsOnRoleSet, loading: loadingRoleSet } = useRoleSetApplicationsAndInvitations({ roleSetId });

  const validationSchema = yup.object().shape({
    welcomeMessage: textLengthValidator({ required: true }),
    selectedContributors: SelectedContributorsArraySchema.min(1).required(),
    extraRoles: yup.array().of(yup.string().oneOf(INVITE_USERS_TO_ROLES)).min(1).required(),
  });

  const initialValues: InviteUsersData = {
    welcomeMessage: t('community.invitations.inviteContributorsDialog.users.defaultWelcomeMessage', {
      spaceName,
    }),
    selectedContributors: [],
    extraRoles: [RoleName.Member],
  };

  const handleClose = () => {
    setInvitationSent(undefined);
    onClose();
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
      extraRoles: data.extraRoles,
    });
    setInvitationSent(result);
  });

  const loading = loadingSpace || resolvingSpace || loadingRoleSet || invitingUsers;

  return (
    <DialogWithGrid open={open} onClose={handleClose} columns={12} aria-labelledby="invite-users-dialog">
      <DialogHeader
        id="invite-users-dialog"
        title={t('community.invitations.inviteContributorsDialog.users.title', { spaceName })}
        onClose={handleClose}
      />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        validateOnMount
        validateOnBlur
        validateOnChange
        onSubmit={onSubmit}
      >
        {({ handleSubmit, isValid, setFieldValue, getFieldMeta, getFieldProps }) => {
          const invalidSelectedContributors =
            !isValid && getFieldMeta('selectedContributors').error && getFieldMeta('selectedContributors').touched;
          const selectedContributorsValue = getFieldProps('selectedContributors').value;

          return (
            <>
              {!invitationsResults && (
                <>
                  <InviteUsersFormDialogContent
                    parentSpaceId={parentSpaceId}
                    filterUsers={filterContributors}
                    onlyFromParentCommunity={onlyFromParentCommunity}
                  />
                  <DialogActions>
                    {invalidSelectedContributors && selectedContributorsValue.length === 0 && (
                      <Caption color="error">
                        {t('community.invitations.inviteContributorsDialog.users.validationErrors.required')}
                      </Caption>
                    )}
                    {invalidSelectedContributors && selectedContributorsValue.length > 0 && (
                      <Caption color="error">
                        {t('community.invitations.inviteContributorsDialog.users.validationErrors.invalidAddress')}
                      </Caption>
                    )}
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
                        handleClose();
                      }}
                    >
                      {t('buttons.close')}
                    </Button>
                  </DialogActions>
                </>
              )}
            </>
          );
        }}
      </Formik>
    </DialogWithGrid>
  );
};

export default InviteUsersDialog;
