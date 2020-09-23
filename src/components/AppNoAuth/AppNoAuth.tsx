import React from 'react';
import ChallengeList from '../ChallengeList';
import ChallengeProfile from '../ChallengeProfile';
import EcoverseProfile from '../EcoverseProfile';
import './AppNoAuth.css';

const AppNoAuth = (): React.ReactElement => {
  const [id, setId] = React.useState(2);
  const handleIdChange = React.useCallback(newId => {
    setId(newId);
  }, []);

  return (
    <div className="AppNoAuth">
      <EcoverseProfile />
      <ChallengeList handleIdChange={handleIdChange} />
      <ChallengeProfile id={id} />
    </div>
  );
};

export default AppNoAuth;
