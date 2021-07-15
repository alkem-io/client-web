import React, { FC } from 'react';
import { PageProps } from '../../pages';
import { ApplicationRoute } from './ApplicationRoute';
import { Application, User } from '../../types/graphql-schema';
import Loading from '../../components/core/Loading';

interface Props extends PageProps {}

export const ChallengeApplicationRoute: FC<Props> = ({ paths }) => {
  const data = [
    {
      id: '1',
      user: { displayName: 'Chall-user' } as User,
      lifecycle: { id: '1', machineDef: '' },
      questions: [
        { id: '1', name: 'Is this ecoverse', value: 'No' },
        { id: '2', name: 'Is this challenge', value: 'Yes' },
      ],
    },
    {
      id: '2',
      user: { displayName: 'Chall-user2' } as User,
      lifecycle: { id: '1', machineDef: '' },
      questions: [
        { id: '1', name: 'Is this ecoverse2', value: 'No2' },
        { id: '2', name: 'Is this challenge2', value: 'Yes2' },
      ],
    },
  ] as Application[]; // get applications by ecoverseId & challengeId
  const applications = data;
  const loading = false;

  if (loading) {
    return <Loading />;
  }

  return <ApplicationRoute paths={paths} applications={applications} />;
};
