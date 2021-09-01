import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import { FourOuFour } from '../../pages';
import { QuestionTemplate } from '../../models/graphql-schema';
import { Path } from '../../context/NavigationProvider';
import ApplyPage, { ApplyPageType } from '../../pages/ApplyPage';
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
  type: ApplyPageType;
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
  type,
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
          type={type}
        />
      </RestrictedRoute>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default ApplyRoute;
