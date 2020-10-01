import React from 'react';
import EcoverseContainer from '../../containers/EcoverseContainer';
import Header from '../Header';
import './AppNoAuth.css';

const AppNoAuth = (): React.ReactElement => {
  const noOp = () => {};
  return (
    <div className="AppNoAuth">
      <Header userName="No Logged User" isAuthenticated={false} onSignIn={noOp} onSignOut={noOp} />
      <EcoverseContainer />
    </div>
  );
};

export default AppNoAuth;
