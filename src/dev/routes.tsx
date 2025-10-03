import { Route } from 'react-router-dom';
import TypographyDemo from './ui/TypographyDemo';
import GridDemo from './ui/GridDemo';
import DashboardComponentsDemo from './ui/DashboardComponentsDemo';
import SpaceCardsDemo from './ui/SpaceCardsDemo';
import TableDemo from './ui/TableDemo';
import SearchCardsDemo from './ui/SearchCardsDemo';
import DashboardNavigationDemo from './ui/DashboardNavigationDemo';

const devRoutes = () => (
  <Route path="dev">
    <Route path="ui/typography" element={<TypographyDemo />} />
    <Route path="ui/grid" element={<GridDemo />} />
    <Route path="ui/dashboard" element={<DashboardComponentsDemo />} />
    <Route path="ui/cards" element={<SpaceCardsDemo />} />
    <Route path="ui/table" element={<TableDemo />} />
    <Route path="ui/search-cards" element={<SearchCardsDemo />} />
    <Route path="ui/dashboard-navigation" element={<DashboardNavigationDemo />} />
  </Route>
);

export default import.meta.env.MODE === 'development' ? devRoutes : () => null;
