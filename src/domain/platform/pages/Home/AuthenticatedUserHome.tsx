import React, { forwardRef } from 'react';
import MyHubsSection from '../../../challenge/hub/MyHubs/MyHubsSection';
import { useTranslation } from 'react-i18next';
import { UserContextValue } from '../../../community/contributor/user/providers/UserProvider/UserProvider';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';

interface AuthenticatedUserHomeProps {
  user: UserContextValue;
}

const AuthenticatedUserHome = forwardRef<HTMLDivElement, AuthenticatedUserHomeProps>(({ user }, ref) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock ref={ref}>
      <WrapperTypography variant="h3" weight="bold">
        {t('pages.home.sections.welcome.welcome-back', { username: user.user?.user.firstName })}
      </WrapperTypography>
      <MyHubsSection userHubRoles={user.userHubRoles} loading={user.loading} />
    </PageContentBlock>
  );
});

export default AuthenticatedUserHome;
