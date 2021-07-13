import React, { FC } from 'react';
import { Route, Switch } from 'react-router';
import { FourOuFour } from '../../pages';
import { QuestionTemplate } from '../../types/graphql-schema';
import { Path } from '../../context/NavigationProvider';
import ApplyPage from '../../pages/ApplyPage';
import RestrictedRoute from '../route.extensions';

interface Props {
  paths: Path[];
  path: string;
  communityId: string;
  communityName: string;
  tagline: string;
  avatar: string;
  questions: QuestionTemplate[];
  loading: boolean;
  error: boolean;
  backUrl: string;
}

const ApplyRoute: FC<Props> = ({
  paths,
  path,
  communityId,
  communityName,
  tagline,
  avatar,
  questions,
  loading,
  error,
  backUrl,
}) => {
  return (
    <Switch>
      <RestrictedRoute path={`${path}/apply`}>
        <ApplyPage
          paths={paths}
          communityId={communityId}
          communityName={communityName}
          questions={questions}
          tagline={tagline}
          avatar={avatar}
          backUrl={backUrl}
          loading={loading}
          error={error}
        />
      </RestrictedRoute>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default ApplyRoute;
