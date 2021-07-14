import React, { FC } from 'react';
import { PageProps } from '../../pages';
import { ApplicationRoute } from './ApplicationRoute';
import { Application, User } from '../../types/graphql-schema';

interface Props extends PageProps {}

export const EcoverseApplicationRoute: FC<Props> = ({ paths }) => {
  const data = [
    {
      id: '1',
      user: { displayName: 'Eco-user1' } as User,
      lifecycle: { id: '1', machineDef: '' },
      questions: [
        { id: '1', name: 'Is this ecoverse', value: 'Yes' },
        { id: '2', name: 'Is this challenge', value: 'No' },
      ],
    },
    {
      id: '2',
      user: { displayName: 'Eco-user2' } as User,
      lifecycle: { id: '1', machineDef: '' },
      questions: [
        { id: '1', name: 'Is this ecoverse2', value: 'Yes2' },
        { id: '2', name: 'Is this challenge2', value: 'No2' },
      ],
    },
  ] as Application[]; // get applications by ecoverseId & challengeId
  const applications = data;

  return <ApplicationRoute paths={paths} applications={applications} />;
};
