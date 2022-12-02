import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { AvatarsProvider } from '../../../../../context/AvatarsProvider';
import { User } from '../../../../../core/apollo/generated/graphql-schema';
import Avatar from '../../../../../common/components/core/Avatar';
import AvatarContainer from '../../../../../common/components/core/AvatarContainer';
import WrapperButton from '../../../../../common/components/core/WrapperButton';
import WrapperTypography from '../../../../../common/components/core/WrapperTypography';
import { useTranslation } from 'react-i18next';

interface GroupMembersDetailsProps {
  members: User[];
  editLink?: boolean;
}

export const GroupMembersDetails: FC<GroupMembersDetailsProps> = ({ members, editLink }) => {
  const { t } = useTranslation();
  return (
    <>
      <WrapperTypography variant={'h4'}>Members</WrapperTypography>
      <AvatarsProvider users={members}>
        {populated => {
          const avatars = populated;
          return (
            <>
              <AvatarContainer title={''}>
                {avatars.map((u, i) => (
                  <Avatar key={i} src={u.profile?.avatar?.uri} userId={u.id} name={u.displayName} />
                ))}
              </AvatarContainer>
              <div style={{ flexBasis: '100%' }} />
              {members.length - populated.length > 0 && (
                <WrapperTypography variant="h3" as="h3" color="positive">
                  {`... + ${members.length - populated.length} other members`}
                </WrapperTypography>
              )}
            </>
          );
        }}
      </AvatarsProvider>
      {editLink && <WrapperButton small as={Link} to={'members'} text={t('buttons.edit-members')} />}
    </>
  );
};
export default GroupMembersDetails;
