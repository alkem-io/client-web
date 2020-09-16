import React from 'react';
import ChallengeList from '../ChallengeList';
import ChallengeProfile from '../ChallengeProfile';
import EcoverseProfile from '../EcoverseProfile';
import './App.css';

const App = () => {
  const [id, setId] = React.useState(2);
  const handleIdChange = React.useCallback(newId => {
    setId(newId);
  }, []);

  return (
    <div className="App">
      <EcoverseProfile />
      <ChallengeList handleIdChange={handleIdChange}/>
      <ChallengeProfile id={id} />
    </div>
  );
};
 
export default App;
