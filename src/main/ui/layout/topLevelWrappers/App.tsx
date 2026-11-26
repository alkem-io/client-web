import { Outlet } from 'react-router-dom';

const App = () => (
  <div className="flex flex-col flex-grow">
    <div className="relative flex flex-col flex-grow">
      <Outlet />
    </div>
  </div>
);

export default App;
