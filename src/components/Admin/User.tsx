import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
/*lib imports end*/

import { EditMode, UserFrom } from './UserFrom';
/*components files imports end*/

import { QUERY_USER } from './query';
import { defaultUser } from '../../models/User';
/*local files imports end*/

interface UserProps {
  mode: 'new' | 'edit' | 'readOnly';
}

const User: FC<UserProps> = ({ mode }) => {
  const { userId } = useParams<{ userId: string }>();
  const { data } = useQuery(QUERY_USER, { variables: { id: userId } });

  return <UserFrom user={data?.user || defaultUser} editMode={EditMode[mode]} title={'User edit'} />;
};

export default User;
