/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { ChallengeListQuery } from '../../generated/graphql';
import './styles.css';

export interface OwnProps {
  handleIdChange: (newId: number) => void;
}

interface Props extends OwnProps {
  data: ChallengeListQuery;
}

const className = 'ChallengeList';

const ChallengeList: React.FC<Props> = ({ data, handleIdChange }) => (
  <div className={className}>
    <h3>Challenges</h3>
    <ol className={`${className}__list`}>
      {!!data.challenges &&
        data.challenges.map(
          Challenge =>
            !!Challenge && (
              <li
                key={Challenge.id}
                className={`${className}__item`}
                onClick={() => handleIdChange(Number(Challenge.id))}
              >
                <b>{Challenge.name}</b>
              </li>
            )
        )}
    </ol>
  </div>
);

export default ChallengeList;
