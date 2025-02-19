import { Route, Routes } from 'react-router-dom';
import WhiteboardPage from '../EntityWhiteboardPage/WhiteboardPage';
import withUrlResolverParams from '@/main/routing/urlResolver/withUrlResolverParams';

export interface WhiteboardRouteProps {
  parentPagePath: string;
}

const WhiteboardRoute = ({ parentPagePath }: WhiteboardRouteProps) => {
  return (
    <Routes>
      <Route path="/" element={<WhiteboardPage parentUrl={parentPagePath} />} />
    </Routes>
  );
};

export default withUrlResolverParams(WhiteboardRoute);
