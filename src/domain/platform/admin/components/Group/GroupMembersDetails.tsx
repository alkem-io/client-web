import { User } from '@/core/apollo/generated/graphql-schema';
import AlkemioAvatar from '@/core/ui/image/AlkemioAvatar';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';
import { UserAvatarsProvider } from '@/domain/community/user/containers/UserAvatarsProvider/UserAvatarsProvider';
import UserPopUp from '@/domain/community/user/userPopUp/UserPopUp';
import { Button } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import GroupMembersDetailsAvatarContainer from './GroupMembersDetailsAvatarContainer';

interface GroupMembersDetailsProps {
  members: User[];
  editLink?: boolean;
}

export const GroupMembersDetails: FC<GroupMembersDetailsProps> = ({ members, editLink }) => {
  const { t } = useTranslation();
  return (
    <>
      <WrapperTypography variant={'h4'}>Members</WrapperTypography>
      <UserAvatarsProvider users={members}>
        {populated => {
          const avatars = populated;
          return (
            <>
              <GroupMembersDetailsAvatarContainer title={''}>
                {avatars.map((u, i) => (
                  <AlkemioAvatar
                    key={i}
                    src={u.profile.visual?.uri}
                    name={u.profile.displayName}
                    renderPopup={({ open, onHide }) => open && <UserPopUp id={u.id} onHide={onHide} />}
                  />
                ))}
              </GroupMembersDetailsAvatarContainer>
              <div style={{ flexBasis: '100%' }} />
              {members.length - populated.length > 0 && (
                <WrapperTypography variant="h3" as="h3" color="positive">
                  {`... + ${members.length - populated.length} other members`}
                </WrapperTypography>
              )}
            </>
          );
        }}
      </UserAvatarsProvider>
      {editLink && (
        <Button component={Link} to={'members'}>
          {t('buttons.edit-members')}
        </Button>
      )}
    </>
  );
};

export default GroupMembersDetails;
