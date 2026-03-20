import { Box, DialogContent } from '@mui/material';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikMultiSelect from '@/core/ui/forms/FormikMultiSelect';
import { LONG_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import FormikContributorsSelectorField, {
  type FormikContributorsSelectorFieldProps,
} from '../components/FormikContributorsSelectorField/FormikContributorsSelectorField';
import { INVITE_USERS_TO_ROLES } from './InviteUsersDialog';

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
      <Gutters disablePadding={true}>
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
          multiline={true}
          rows={5}
          maxLength={LONG_TEXT_LENGTH}
        />
        <Gutters disablePadding={true} row={true} justifyContent="space-between" alignItems="center">
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
              required={true}
            />
          </Box>
        </Gutters>
      </Gutters>
    </DialogContent>
  );
};

export default InviteUsersFormDialogContent;
