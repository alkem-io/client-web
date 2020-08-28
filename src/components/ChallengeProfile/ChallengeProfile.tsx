import * as React from 'react';
import { ChallengeProfileQuery } from '../../generated/graphql';
import './styles.css';

interface Props {
  data: ChallengeProfileQuery;
}

const className = 'ChallengeProfile';

const ChallengeProfile: React.FC<Props> = ({ data }) => {
  return <div>No challenge available</div>;
  /*if (!data.challenge) {
    return <div>No challenge available</div>;
  }

  return (
    <div className={className}>
      <div className={`${className}__status`}>
        <span>Challenge {data.challenge.name}: </span>
        {data.challenge.name ? (
          <span className={`${className}__success`}>Success</span>
        ) : (
          <span className={`${className}__failed`}>Failed</span>
        )}
      </div>
      <h1 className={`${className}__title`}>
        {data.challenge.name}
        
      </h1>
      
    </div>
  );*/
};

export default ChallengeProfile;