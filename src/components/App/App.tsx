import React from 'react';
import { useSelector } from 'react-redux';
import EcoverseContainer from '../../containers/EcoverseContainer';
import { ErrorHandler } from '../../containers/ErrorHandler';
import { useAuthentication } from '../../hooks';
import { RootState } from '../../reducers';
import Header from '../Header';
import './App.css';

const App = (): React.ReactElement => {
  const { handleSignIn, handleSignOut } = useAuthentication();

  const username = useSelector<RootState, string>(state => (state.auth.account ? state.auth.account.username : ''));
  const isAuthenticated = useSelector<RootState, boolean>(state => state.auth.isAuthenticated);

  return (
    <div className="App">
      <Header userName={username} isAuthenticated={isAuthenticated} onSignIn={handleSignIn} onSignOut={handleSignOut} />
      <ErrorHandler>
        <EcoverseContainer />
      </ErrorHandler>
    </div>
  );
};

export default App;
