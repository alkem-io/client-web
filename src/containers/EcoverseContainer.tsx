import React from 'react';
import ChallengeList from '../components/ChallengeList';
import ChallengeProfile from '../components/ChallengeProfile';
import EcoverseProfile from '../components/EcoverseProfile';

const EcoverseContainer = (): JSX.Element => {
  const [id, setId] = React.useState(2);
  const handleIdChange = React.useCallback(newId => {
    setId(newId);
  }, []);

  return (
    <div className="App">
      <EcoverseProfile />
      <ChallengeList handleIdChange={handleIdChange} />
      <ChallengeProfile id={id} />
    </div>
  );
};

export default EcoverseContainer;
