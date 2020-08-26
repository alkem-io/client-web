import * as React from 'react';
import { ChallengeListQuery } from '../../generated/graphql';
import './styles.css';

interface Props {
  data: ChallengeListQuery;
}

const className = 'ChallengeList';

const ChallengeList: React.FC<Props> = ({ data }) => (
  <div className={className}>
    <h3>Challenges</h3>
    <ol className={`${className}__list`}>
      {!!data.allChallenges &&
        data.allChallenges.map(
          (Challenge, i) =>
            !!Challenge && (
              <li key={i} className={`${className}__item`}>
                {Challenge.name} desc({Challenge.description})
              </li>
            ),
        )}
    </ol>
  </div>
);

export default ChallengeList;