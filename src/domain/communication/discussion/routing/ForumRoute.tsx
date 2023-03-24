import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../core/routing/urlParams';
import ForumPage from '../pages/ForumPage';

interface ForumRouteProps {}

export const ForumRoute: FC<ForumRouteProps> = () => {
  //!! TODO: Do something with config value ??
  // import { FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../../platform/config/features.constants';
  //const { isFeatureEnabled } = useConfig();
  //if (!isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)) return <Error404 />;

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<ForumPage />} />
        <Route path="/new" element={<ForumPage dialog="new" />} />
        <Route path={`:${nameOfUrl.discussionId}`} element={<ForumPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default ForumRoute;
