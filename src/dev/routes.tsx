import { Route } from 'react-router';
import TypographyDemo from './ui/TypographyDemo';
import GridDemo from './ui/GridDemo';
import DashboardComponentsDemo from './ui/DashboardComponentsDemo';

const devRoutes = () => {
  return (
    <Route path="dev">
      <Route path="ui/typography" element={<TypographyDemo />} />
      <Route path="ui/grid" element={<GridDemo />} />
      <Route path="ui/dashboard" element={<DashboardComponentsDemo />} />
    </Route>
  );
};

export default process.env.NODE_ENV === 'development' ? devRoutes : () => null;
