import MailOutlined from '@mui/icons-material/MailOutlined';
import { IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import ChangeUserEmailDialog from './ChangeUserEmailDialog';

type UserEmailChangeRowActionProps = {
  userId: string;
  currentEmail: string;
};

const UserEmailChangeRowAction = ({ userId, currentEmail }: UserEmailChangeRowActionProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { data } = usePlatformLevelAuthorizationQuery();
  const isPlatformAdmin = Boolean(
    data?.platform.authorization?.myPrivileges?.includes(AuthorizationPrivilege.PlatformAdmin)
  );

  const tooltip = isPlatformAdmin
    ? t('pages.admin.users.emailChange.rowAction.tooltip')
    : t('pages.admin.users.emailChange.rowAction.disabledTooltip');

  return (
    <>
      <Tooltip title={tooltip} arrow={true}>
        <span>
          <IconButton
            onClick={() => setOpen(true)}
            disabled={!isPlatformAdmin}
            size="large"
            aria-label={t('pages.admin.users.emailChange.rowAction.label')}
          >
            <MailOutlined />
          </IconButton>
        </span>
      </Tooltip>
      <ChangeUserEmailDialog open={open} userId={userId} currentEmail={currentEmail} onClose={() => setOpen(false)} />
    </>
  );
};

export default UserEmailChangeRowAction;
