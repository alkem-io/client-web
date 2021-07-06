import React, { FC } from 'react';
import { Route, Switch } from 'react-router';
import { FourOuFour } from '../../pages';
import { QuestionTemplate } from '../../types/graphql-schema';
import { Path } from '../../context/NavigationProvider';
import ApplyPage from '../../pages/ApplyPage';

interface Props {
  paths: Path[];
  path: string;
  communityId: string;
  questions: QuestionTemplate[];
  loading: boolean;
  error: boolean;
  backUrl: string;
}

const ApplyRoute: FC<Props> = ({ paths, path, communityId, questions, loading, error, backUrl }) => {
  return (
    <Switch>
      <Route path={`${path}/apply`}>
        <ApplyPage
          paths={paths}
          communityId={communityId}
          questions={questions}
          backUrl={backUrl}
          loading={loading}
          error={error}
        />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default ApplyRoute;
