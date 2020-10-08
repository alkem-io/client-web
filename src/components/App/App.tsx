import React from 'react';
import EcoverseContainer from '../../containers/EcoverseContainer';
import { useAuthentication } from '../../hooks';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { Home } from '../../pages';
import Header from '../Header';

const App = (): React.ReactElement => {
  const { handleSignIn, handleSignOut } = useAuthentication();

  const username = useTypedSelector<string>(state => (state.auth.account ? state.auth.account.username : ''));
  const isAuthenticated = useTypedSelector<boolean>(state => state.auth.isAuthenticated);

  let page = <Home />;

  if (isAuthenticated) {
    page = <EcoverseContainer />;
  }

  return (
    <div className="App">
      <Header userName={username} isAuthenticated={isAuthenticated} onSignIn={handleSignIn} onSignOut={handleSignOut} />
      {page}
    </div>
  );
};

export default App;
