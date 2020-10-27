import React, { useContext } from 'react';
import { appContext } from '../../context/AppProvider';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { Home } from '../../pages';
import { EcoversePage } from '../EcoversePage';

const App = (): React.ReactElement => {
  const context = useContext(appContext);

  const isAuthenticated = useTypedSelector<boolean>(state => state.auth.isAuthenticated);

  let page = <Home />;

  if (!context.enableAuthentication || isAuthenticated) {
    page = <EcoversePage ecoverse={context.ecoverse} />;
  }

  return <div className="App">{page}</div>;
};

export default App;
