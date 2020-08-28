import React from 'react';
import ChallengeList from './ChallengeList';
import ChallengeProfile from './ChallengeProfile';
import EcoverseProfile from './EcoverseProfile';
import '../styles/App.css';

const App = () => {
  const [id, setId] = React.useState(42);
  const handleIdChange = React.useCallback(newId => {
    setId(newId);
  }, []);

  return (
    <div className="App">
      <EcoverseProfile />
      <ChallengeList handleIdChange={handleIdChange}/>
    </div>
  );
};
 
export default App;
