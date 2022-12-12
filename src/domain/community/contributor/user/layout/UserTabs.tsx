import React, { useMemo } from 'react';
import { EntityTabsProps } from '../../../../shared/layout/PageLayout';
import { useUserContext } from '../hooks/useUserContext';
import { useUserMetadata } from '../hooks/useUserMetadata';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { AssignmentIndOutlined } from '@mui/icons-material';
import ProfileTabs from '../../../../shared/layout/ProfileTabs';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { buildUserProfileSettingsUrl, buildUserProfileUrl } from '../../../../../common/utils/urlBuilders';

const UserTabs = (props: EntityTabsProps) => {
  const { user } = useUserContext();

  const { userNameId = '' } = useUrlParams();
  const { user: userMetadata } = useUserMetadata(userNameId);

  const isCurrentUser = useMemo(() => user?.user.id === userMetadata?.user.id, [user, userMetadata]);

  const routes = useMemo(
    () => ({
      [EntityPageSection.Profile]: buildUserProfileUrl(userNameId),
      [EntityPageSection.Settings]: buildUserProfileSettingsUrl(userNameId),
    }),
    [userNameId]
  );

  return (
    <ProfileTabs showSettings={isCurrentUser} profileIconComponent={AssignmentIndOutlined} routes={routes} {...props} />
  );
};

export default UserTabs;
