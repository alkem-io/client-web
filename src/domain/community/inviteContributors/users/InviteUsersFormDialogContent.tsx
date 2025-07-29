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
import FormikMultiSelect from '@/core/ui/forms/FormikMultiSelect';
import { INVITE_USERS_TO_ROLES } from './InviteUsersDialog';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

interface InviteUsersFormDialogContentProps {
  filterUsers?: FormikContributorsSelectorFieldProps['filterUsers'];
  parentSpaceId?: string;
  onlyFromParentCommunity?: boolean;
}

const InviteUsersFormDialogContent: React.FC<InviteUsersFormDialogContentProps> = ({
  filterUsers,
  parentSpaceId,
  onlyFromParentCommunity = false,
}) => {
  const { t } = useTranslation();
  const titleKey =
    `community.invitations.inviteContributorsDialog.users.${onlyFromParentCommunity ? 'descriptionMembers' : 'description'}` as TranslationKey;

  return (
    <DialogContent>
      <Gutters disablePadding>
        <Caption>{t(titleKey)}</Caption>
        <FormikContributorsSelectorField
          name="selectedContributors"
          filterUsers={filterUsers}
          onlyFromParentCommunity={onlyFromParentCommunity}
          parentSpaceId={parentSpaceId}
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
            <FormikMultiSelect
              name="extraRoles"
              fixedOptions={[{ id: RoleName.Member, name: t(`common.roles.${RoleName.Member}`) }]}
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
