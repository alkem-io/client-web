import React, { useState } from 'react';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import { Trans } from 'react-i18next';
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
    <DashboardBanner to={createLink}>
      <Trans
        i18nKey="pages.home.sections.startingSpace.title"
        components={{
          big: <BlockTitle />,
          small: <Caption />,
        }}
      />
    </DashboardBanner>
  );
};

export default StartingSpace;
