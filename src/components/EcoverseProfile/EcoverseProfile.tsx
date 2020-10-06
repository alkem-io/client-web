import React from 'react';
import { EcoverseListQuery } from '../../generated/graphql';
import './styles.css';

interface Props {
  data: EcoverseListQuery;
}

const className = 'EcoverseProfile';

const EcoverseProfile: React.FC<Props> = ({ data }) => (
  <div className={className}>
    <h2>Ecoverse: {data.name}</h2>
  </div>
);

export default EcoverseProfile;
