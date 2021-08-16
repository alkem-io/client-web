import React, { FC } from 'react';
import { AvatarsProvider } from '../../context/AvatarsProvider';
import { User } from '../../models/graphql-schema';
import shuffleCollection from '../../utils/shuffleCollection';
import Avatar from '../core/Avatar';
import AvatarContainer from '../core/AvatarContainer';
import Typography from '../core/Typography';

interface MembersProps {
  shuffle?: boolean;
  users: User[];
}

export const Members: FC<MembersProps> = ({ shuffle = false, users }) => {
  return (
    <AvatarsProvider users={users}>
      {populated => {
        const avatars = shuffle ? shuffleCollection(populated) : populated;
        return (
          <>
            <AvatarContainer title={'Active community members'}>
              {avatars.map((u, i) => (
                <Avatar key={i} src={u.profile?.avatar} userId={u.id} name={u.displayName} />
              ))}
            </AvatarContainer>
            <div style={{ flexBasis: '100%' }} />
            {users.length - populated.length > 0 && (
              <Typography variant="h3" as="h3" color="positive">
                {`... + ${users.length - populated.length} other members`}
              </Typography>
            )}
          </>
        );
      }}
    </AvatarsProvider>
  );
};
export default Members;
