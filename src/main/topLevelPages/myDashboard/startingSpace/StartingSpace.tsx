import React from 'react';
import { Text } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import DashboardBanner from '../../../../core/ui/content/DashboardBanner';
import { useUserContext } from '../../../../domain/community/user/hooks/useUserContext';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { ROUTE_CREATE_SPACE } from '../../../../domain/platform/routes/constants';

const StartingSpace = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  let createLink = t('pages.home.sections.startingSpace.url');

  if (user && user.hasPlatformPrivilege(AuthorizationPrivilege.CreateSpace)) {
    createLink = `/${ROUTE_CREATE_SPACE}`;
  }

  return (
    <DashboardBanner to={createLink} containerProps={{ justifyContent: 'center' }}>
      <Text>{t('pages.home.sections.myAccount.createSpaceButton')}</Text>
    </DashboardBanner>
  );
};

export default StartingSpace;
