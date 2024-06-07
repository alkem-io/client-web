import { Route } from 'react-router';
import TypographyDemo from './ui/TypographyDemo';
import GridDemo from './ui/GridDemo';
import DashboardComponentsDemo from './ui/DashboardComponentsDemo';
import JourneyCardsDemo from './ui/JourneyCardsDemo';
import TableDemo from './ui/TableDemo';
import SearchCardsDemo from './ui/SearchCardsDemo';
import DashboardNavigationDemo from './ui/DashboardNavigationDemo';
import FlexColumnGrowModal from './ui/FlexColumnGrowModal';

const devRoutes = () => {
  return (
    <Route path="dev">
      <Route path="ui/typography" element={<TypographyDemo />} />
      <Route path="ui/grid" element={<GridDemo />} />
      <Route path="ui/dashboard" element={<DashboardComponentsDemo />} />
      <Route path="ui/cards" element={<JourneyCardsDemo />} />
      <Route path="ui/table" element={<TableDemo />} />
      <Route path="ui/search-cards" element={<SearchCardsDemo />} />
      <Route path="ui/dashboard-navigation" element={<DashboardNavigationDemo />} />
      <Route path="ui/flex-column-grow" element={<FlexColumnGrowModal />} />
    </Route>
  );
};

export default import.meta.env.MODE === 'development' ? devRoutes : () => null;
