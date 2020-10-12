import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Ecoverse, Challenge } from '../models';

export interface EcoversePageProps {
  ecoverse: Ecoverse;
  challenges: Challenge[];
}

export const EcoversePage: FC<EcoversePageProps> = ({ ecoverse, challenges }) => {
  return (
    <>
      <h1>{ecoverse.name}</h1>
      <h2>Challenges:</h2>
      <ul>
        {challenges.map(c => (
          <li key={c.altId}>
            <Link to={`/challenge/${c.altId}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};
