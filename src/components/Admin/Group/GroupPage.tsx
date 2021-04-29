import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Member } from '../../../models/User';
import { PageProps } from '../../../pages';
import EditGroup from '../Community/EditGroup';

interface Parameters {
  groupId: string;
}

interface GroupPageProps extends PageProps {
  parentMembers: Member[];
}

export const GroupPage: FC<GroupPageProps> = ({ paths, parentMembers = [] }) => {
  const { groupId } = useParams<Parameters>();
  return (
    <Container>
      <EditGroup paths={paths} groupId={groupId} parentMembers={parentMembers} />;
    </Container>
  );
};

export default GroupPage;
