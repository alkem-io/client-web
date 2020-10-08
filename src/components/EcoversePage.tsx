import React, { FC } from 'react';
import { Ecoverse } from '../models/Ecoverse';

export interface EcoversePageProps {
  ecoverse: Ecoverse;
}

export const EcoversePage: FC<EcoversePageProps> = ({ ecoverse }) => {
  return <h1>{ecoverse.name}</h1>;
};
