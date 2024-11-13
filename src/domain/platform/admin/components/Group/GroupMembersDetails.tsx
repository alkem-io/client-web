import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { UserAvatarsProvider } from '../../../../community/user/containers/UserAvatarsProvider/UserAvatarsProvider';
import { User } from '@core/apollo/generated/graphql-schema';
import AlkemioAvatar from '@core/ui/image/AlkemioAvatar';
import GroupMembersDetailsAvatarContainer from './GroupMembersDetailsAvatarContainer';
import WrapperButton from '@core/ui/button/deprecated/WrapperButton';
import WrapperTypography from '@core/ui/typography/deprecated/WrapperTypography';
import { useTranslation } from 'react-i18next';
import UserPopUp from '../../../../community/user/userPopUp/UserPopUp';

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
      {editLink && <WrapperButton small as={Link} to={'members'} text={t('buttons.edit-members')} />}
    </>
  );
};

export default GroupMembersDetails;
