import React from 'react';
import EcoverseContainer from '../../containers/EcoverseContainer';
import Header from '../Header';
import { ErrorHandler } from '../../containers/ErrorHandler';
import './AppNoAuth.css';

const AppNoAuth = (): React.ReactElement => {
  return (
    <div>
      <Header userName="No Logged User" isAuthenticated={false} />
      <ErrorHandler>
        <EcoverseContainer />
      </ErrorHandler>
    </div>
  );
};

export default AppNoAuth;
