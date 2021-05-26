import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { AvatarsProvider } from '../../../context/AvatarsProvider';
import { User } from '../../../types/graphql-schema';
import Avatar from '../../core/Avatar';
import AvatarContainer from '../../core/AvatarContainer';
import Button from '../../core/Button';
import Typography from '../../core/Typography';

interface GroupMembersDetailsProps {
  members: User[];
  editLink?: string;
}

export const GroupMembersDetails: FC<GroupMembersDetailsProps> = ({ members, editLink }) => {
  return (
    <>
      <Typography variant={'h4'}>Members</Typography>
      <AvatarsProvider users={members}>
        {populated => {
          const avatars = populated;
          return (
            <>
              <AvatarContainer className="d-flex" title={''}>
                {avatars.map((u, i) => (
                  <Avatar
                    className={'d-inline-flex'}
                    key={i}
                    src={u.profile?.avatar}
                    userId={u.id}
                    name={u.displayName}
                  />
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
      {editLink && (
        <Button className={'mt-2'} small as={Link} to={editLink}>
          {'Edit Members'}
        </Button>
      )}
    </>
  );
};
export default GroupMembersDetails;
