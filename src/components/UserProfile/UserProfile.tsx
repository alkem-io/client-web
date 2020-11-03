import React from 'react';
import { useQuery } from '@apollo/client';
/*lib imports end*/

import UserFrom, { EditMode } from '../Admin/UserFrom';
/*components imports end*/

import { QUERY_USER_PROFILE } from './query';
import { defaultUser } from '../../models/User';
import { Container } from 'react-bootstrap';
/*local files imports end*/

const UserProfile = () => {
  const { data } = useQuery(QUERY_USER_PROFILE);
  return (
    <Container>
      <UserFrom user={data?.me || defaultUser} editMode={EditMode.readOnly} title={'My profile'} />;
    </Container>
  );
};

export default UserProfile;
