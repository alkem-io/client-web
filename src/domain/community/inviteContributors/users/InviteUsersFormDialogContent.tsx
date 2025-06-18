import React from 'react';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption } from '@/core/ui/typography';
import { Box, DialogContent } from '@mui/material';
import FormikContributorsSelectorField, {
  FormikContributorsSelectorFieldProps,
} from '../components/FormikContributorsSelectorField/FormikContributorsSelectorField';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { useTranslation } from 'react-i18next';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { gutters } from '@/core/ui/grid/utils';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import { INVITE_USERS_TO_ROLES } from './InviteUsersDialog';

interface InviteUsersFormDialogContentProps {
  filterUsers?: FormikContributorsSelectorFieldProps['filterUsers'];
  /** Enable external email invites */
  allowExternalInvites: boolean;
}

const InviteUsersFormDialogContent: React.FC<InviteUsersFormDialogContentProps> = ({
  filterUsers,
  allowExternalInvites = true,
}) => {
  const { t } = useTranslation();

  return (
    <DialogContent>
      <Gutters disablePadding>
        <Caption>{t('community.invitations.inviteContributorsDialog.users.description')}</Caption>
        <FormikContributorsSelectorField
          name="selectedContributors"
          filterUsers={filterUsers}
          allowExternalInvites={allowExternalInvites}
        />
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
              values={INVITE_USERS_TO_ROLES.map(role => ({
                id: role,
                name: t(`common.roles.${role}`),
              }))}
              required
            />
          </Box>
        </Gutters>
      </Gutters>
    </DialogContent>
  );
};

export default InviteUsersFormDialogContent;
