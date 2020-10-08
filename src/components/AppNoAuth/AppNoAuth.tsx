import React from 'react';
import { EcoversePage } from '../../components/EcoversePage';

const AppNoAuth = (): React.ReactElement => {
  return (
    <div>
      <EcoversePage ecoverse={{ name: 'Test Ecoverse' }} />
    </div>
  );
};

export default AppNoAuth;
