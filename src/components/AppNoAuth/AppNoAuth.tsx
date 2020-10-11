import React, { useContext } from 'react';
import { EcoversePage } from '../../components/EcoversePage';
import { appContext } from '../../context/AppProvider';

const AppNoAuth = (): React.ReactElement => {
  const context = useContext(appContext);

  return (
    <div>
      <EcoversePage ecoverse={context.ecoverse} challenges={context.challenges} />
    </div>
  );
};

export default AppNoAuth;
