import { useTranslation } from 'react-i18next';
import { InviteContributorDialogProps } from './InviteContributorsProps';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useSpace } from '@/domain/space/context/useSpace';
import { Box, DialogActions, DialogContent } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import Gutters from '@/core/ui/grid/Gutters';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import { Formik } from 'formik';
import * as yup from 'yup';
import { gutters } from '@/core/ui/grid/utils';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { FormikContributorsSelectorField } from './components/FormikContributorsSelectorField/FormikContributorsSelectorField';
import {
  ContributorSelectorType,
  SelectedContributor,
} from './components/FormikContributorsSelectorField/FormikContributorsSelectorField.models';
import { SelectedContributorSchema } from './components/FormikContributorsSelectorField/FormikContributorsSelectorField.validation';
import SendButton from '@/core/ui/actions/SendButton';
import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { compact } from 'lodash';

const AvailableRoles = [RoleName.Member, RoleName.Lead, RoleName.Admin] as const;

type InviteUsersData = {
  welcomeMessage: string;
  selectedContributors: SelectedContributor[];
  extraRole: RoleName;
};

const InviteUsersDialog = ({ open, onClose }: InviteContributorDialogProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
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
    extraRole: yup.string().oneOf(AvailableRoles).required(),
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
    await inviteContributorsOnRoleSet({
      roleSetId: requiredRoleSetId,
      invitedContributorIds,
      invitedUserEmails,
      welcomeMessage: data.welcomeMessage,
      extraRole: data.extraRole,
    });
  });

  const loading = spaceLoading || loadingRoleSet || invitingUsers;

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogHeader
        title={t('community.invitations.inviteContributorsDialog.users.title', { spaceName })}
        onClose={onClose}
      />
      <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
        {({ handleSubmit, isValid }) => (
          <>
            <DialogContent>
              <Gutters disablePadding>
                <Caption>{t('community.invitations.inviteContributorsDialog.users.description')}</Caption>
                <FormikContributorsSelectorField name="selectedContributors" />
                <FormikInputField
                  name="welcomeMessage"
                  title={t('community.invitations.inviteContributorsDialog.welcomeMessage')}
                  placeholder={t('community.invitations.inviteContributorsDialog.welcomeMessage')}
                  multiline
                  rows={5}
                  maxLength={LONG_TEXT_LENGTH}
                />
                <Gutters disablePadding row justifyContent="space-between" alignItems="center">
                  <Caption>{t('community.invitations.inviteContributorsDialog.users.note')}</Caption>
                  <Box display="flex" gap={gutters()} alignItems="center">
                    <Caption sx={{ whiteSpace: 'nowrap' }}>{t('community.invitations.inviteToRole')}</Caption>
                    <FormikSelect
                      name="extraRole"
                      values={AvailableRoles.map(role => ({
                        id: role,
                        name: t(`common.roles.${role}`),
                      }))}
                      required
                    />
                  </Box>
                </Gutters>
              </Gutters>
            </DialogContent>
            <DialogActions>
              <SendButton loading={loading} disabled={!isValid} onClick={() => handleSubmit()} />
            </DialogActions>
          </>
        )}
      </Formik>
    </DialogWithGrid>
  );
};

export default InviteUsersDialog;
