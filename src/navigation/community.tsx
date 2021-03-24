import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useTransactionScope } from '../hooks/useSentry';
import { Community as CommunityPage, FourOuFour } from '../pages';

export const Community: FC = () => {
  const { t } = useTranslation();

  useTransactionScope({ type: 'connect(search)' });

  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: url, name: t('community.header'), real: true }], []);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <CommunityPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
