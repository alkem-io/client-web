import { Route } from 'react-router';
import TypographyDemo from './ui/TypographyDemo';

const devRoutes = () => {
  return (
    <Route path="dev">
      <Route path="ui/typography" element={<TypographyDemo />} />
    </Route>
  );
};

export default process.env.NODE_ENV === 'development' ? devRoutes : () => null;
