import React, { FC } from 'react';
import { PageProps } from '../../pages';
import { ApplicationRoute } from './ApplicationRoute';
import { useEcoverseApplicationsQuery } from '../../generated/graphql';
import { useParams } from 'react-router';
import { Application } from '../../types/graphql-schema';
import Loading from '../../components/core/Loading';

interface Params {
  ecoverseId: string;
}

interface Props extends PageProps {}

export const EcoverseApplicationRoute: FC<Props> = ({ paths }) => {
  const { ecoverseId } = useParams<Params>();
  const { data, loading } = useEcoverseApplicationsQuery({ variables: { ecoverseId: ecoverseId } });
  const applications = data?.ecoverse?.community?.applications || [];
  /*const data = [
    {
      id: '1',
      user: { displayName: 'Eco-user' } as User,
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
  ] as Application[];
  const applications = data;
  const loading = false;*/

  if (loading) {
    return <Loading />;
  }

  return <ApplicationRoute paths={paths} applications={applications as Application[]} />;
};
