import * as React from 'react';
import { EcoverseListQuery } from '../../generated/graphql';
import './styles.css';

interface Props {
  data: EcoverseListQuery;
}

const className = 'EcoverseProfile';

const EcoverseProfile: React.FC<Props> = ({ data }) => (
  <div className={className}>
    <h2>Ecoverse</h2>
    <ol className={`${className}__list`}>
      {!!data.allEcoverse &&
        data.allEcoverse.map(
          (Ecoverse, i) =>
            !!Ecoverse && (
              <li key={i} className={`${className}__item`}>
                <b></b>{Ecoverse.name}<b></b>
              </li>
            ),
        )}
    </ol>
  </div>
);

export default EcoverseProfile;