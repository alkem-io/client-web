import { useQuery } from '@apollo/client';
import React from 'react';
import { Container } from 'react-bootstrap';
/*components imports end*/
import { QUERY_USER_PROFILE } from '../../graphql/user';
import { defaultUser } from '../../models/User';
/*lib imports end*/
import UserFrom, { EditMode } from '../Admin/UserForm';
import { Loading } from '../core/Loading';
/*local files imports end*/

export const UserProfile = () => {
  const { data, loading } = useQuery(QUERY_USER_PROFILE);

  if (loading) return <Loading />;

  return (
    <Container className={'mt-5'}>
      <UserFrom user={data?.me || defaultUser} editMode={EditMode.readOnly} title={'My profile'} />
    </Container>
  );
};

export default UserProfile;
