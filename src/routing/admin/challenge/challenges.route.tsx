import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import EditChallengePage from '../../../pages/Admin/Challenge/EditChallengePage';
import FormMode from '../../../components/Admin/FormMode';
import { ChallengeProvider } from '../../../context/ChallengeProvider';
import { FourOuFour, PageProps } from '../../../pages';
import ChallengeListPage from '../../../pages/Admin/Challenge/ChallengeListPage';
import { nameOfUrl } from '../../url-params';
import { ChallengeRoute } from './challenge.route';

export const ChallengesRoute: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'challenges', real: true }], [paths]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ChallengeListPage paths={currentPaths} />
      </Route>
      <Route path={`${path}/new`}>
        <EditChallengePage mode={FormMode.create} paths={currentPaths} title={t('navigation.admin.challenge.create')} />
      </Route>
      <Route path={`${path}/:${nameOfUrl.challengeNameId}`}>
        <ChallengeProvider>
          <ChallengeRoute paths={currentPaths} />
        </ChallengeProvider>
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
