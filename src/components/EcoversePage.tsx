import React, { FC, useContext } from 'react';
import { Link } from 'react-router-dom';
import { appContext } from '../context/AppProvider';
import { useChallengesQuery } from '../generated/graphql';
import { Ecoverse } from '../models';

export interface EcoversePageProps {
  ecoverse: Ecoverse;
}

export const EcoversePage: FC<EcoversePageProps> = ({ ecoverse }) => {
  const { data, loading } = useChallengesQuery();
  const challenges = data?.challenges || [];
  const context = useContext(appContext);
  context.challenges = challenges;

  if (loading) {
    return (
      <>
        <p>Loading...</p>
      </>
    );
  }
  return (
    <>
      <h1>{ecoverse.name}</h1>
      <h2>Challenges:</h2>
      <ul>
        {challenges.map(c => (
          <li key={c.textID}>
            <Link to={`/challenge/${c.textID}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};
