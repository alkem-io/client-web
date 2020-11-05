import React, { useContext } from 'react';
import { appContext } from '../../context/AppProvider';
import { configContext } from '../../context/ConfigProvider';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { EcoversePage } from '../EcoversePage';

const App = (): React.ReactElement => {
  const context = useContext(appContext);
  const config = useContext(configContext);

  const isAuthenticated = useTypedSelector<boolean>(state => state.auth.isAuthenticated);

  let page = <div>Home</div>;

  if (!config.aadConfig.authEnabled || isAuthenticated) {
    page = <EcoversePage ecoverse={context.ecoverse} />;
  }

  return <div className="App">{page}</div>;
};

export default App;
