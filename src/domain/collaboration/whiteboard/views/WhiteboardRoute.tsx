import { Route, Routes } from 'react-router-dom';
import WhiteboardPage from '../EntityWhiteboardPage/WhiteboardPage';

export interface WhiteboardRouteProps {
  parentPagePath: string;
}

const WhiteboardRoute = ({ parentPagePath }: WhiteboardRouteProps) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <WhiteboardPage
            parentUrl={parentPagePath}
          />
        }
      />
    </Routes>
  );
};

export default WhiteboardRoute;
