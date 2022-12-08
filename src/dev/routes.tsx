import { Route } from 'react-router';
import TypographyDemo from './ui/TypographyDemo';
import GridDemo from './ui/GridDemo';

const devRoutes = () => {
  return (
    <Route path="dev">
      <Route path="ui/typography" element={<TypographyDemo />} />
      <Route path="ui/grid" element={<GridDemo />} />
    </Route>
  );
};

export default process.env.NODE_ENV === 'development' ? devRoutes : () => null;
