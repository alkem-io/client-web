import * as React from 'react';
import { ChallengeProfileQuery } from '../../generated/graphql';
import './styles.css';

interface Props {
  data: ChallengeProfileQuery;
}

const className = 'ChallengeProfile';

const ChallengeProfile: React.FC<Props> = ({ data }) => {
  
  if (!data.challenge) {
    return <div>No challenge available</div>;
  } 

  console.log("Challenge data available!");

  return (
    <div className={className}>
      <div className={`${className}__status`}>
        <span>Challenge loading: </span>
        {data.challenge.name ? (
          <span className={`${className}__success`}>Success</span>
        ) : (
          <span className={`${className}__failed`}>Failed</span>
        )}
      </div>
      <p>
      <span className={`${className}__title`}>
        <b>Description: </b>
        <i>{data.challenge.context?.description}</i>
      </span>
      </p>
      <p>
      <b>Tags: </b>
      {!!data.challenge.tags &&
        data.challenge.tags.map(
          (Tag, i) =>
            !!Tag && (
              <li key={i} className={`${className}__item`} >
                {Tag.name} &nbsp;
              </li>
            ),
        )}
      </p>
      
    </div>
  );
};

export default ChallengeProfile;