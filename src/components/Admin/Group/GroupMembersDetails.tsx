import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../core/Button';
import Typography from '../../core/Typography';

interface GroupMembersDetailsProps {
  members: string[];
  editLink?: string;
}

export const GroupMembersDetails: FC<GroupMembersDetailsProps> = ({ members, editLink }) => {
  return (
    <>
      <Typography variant={'h3'}>Group Members</Typography>
      <ul>
        {members &&
          members.slice(0, 10).map((m, i) => {
            return <li key={i}>{m}</li>;
          })}
      </ul>
      {editLink && (
        <Button small as={Link} to={editLink}>
          {'Edit Members'}
        </Button>
      )}
    </>
  );
};
export default GroupMembersDetails;
