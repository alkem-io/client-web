import React from 'react';
import EcoverseContainer from '../../containers/EcoverseContainer';
import { ErrorHandler } from '../../containers/ErrorHandler';

const AppNoAuth = (): React.ReactElement => {
  return (
    <div>
      <ErrorHandler>
        <EcoverseContainer />
      </ErrorHandler>
    </div>
  );
};

export default AppNoAuth;
