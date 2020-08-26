import React from 'react';
import ChallengeList from './ChallengeList';
import EcoverseProfile from './EcoverseProfile';
import '../styles/App.css';

const App = () => {
  return (
    <div className="App">
      <EcoverseProfile />
      <ChallengeList />
    </div>
  );
};
 
export default App;
