import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { AvatarsProvider } from '../../../context/AvatarsProvider';
import { User } from '../../../models/graphql-schema';
import Avatar from '../../core/Avatar';
import AvatarContainer from '../../core/AvatarContainer';
import Button from '../../core/Button';
import Typography from '../../core/Typography';
import { useTranslation } from 'react-i18next';

interface GroupMembersDetailsProps {
  members: User[];
  editLink?: string;
}

export const GroupMembersDetails: FC<GroupMembersDetailsProps> = ({ members, editLink }) => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant={'h4'}>Members</Typography>
      <AvatarsProvider users={members}>
        {populated => {
          const avatars = populated;
          return (
            <>
              <AvatarContainer title={''}>
                {avatars.map((u, i) => (
                  <Avatar key={i} src={u.profile?.avatar} userId={u.id} name={u.displayName} />
                ))}
              </AvatarContainer>
              <div style={{ flexBasis: '100%' }} />
              {members.length - populated.length > 0 && (
                <Typography variant="h3" as="h3" color="positive">
                  {`... + ${members.length - populated.length} other members`}
                </Typography>
              )}
            </>
          );
        }}
      </AvatarsProvider>
      {editLink && <Button small as={Link} to={'members'} text={t('buttons.edit-members')} />}
    </>
  );
};
export default GroupMembersDetails;
