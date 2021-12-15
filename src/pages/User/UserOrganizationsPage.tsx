import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateNavigation, useUrlParams, useUserMetadata } from '../../hooks';
import AssociatedOrganizationsView from '../../views/ProfileView/AssociatedOrganizationsView';
import { PageProps } from '../common';
import { useRouteMatch } from 'react-router';

export interface UserOrganizationsPageProps extends PageProps {}

const UserOrganizationsPage: FC<UserOrganizationsPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const { userId } = useUrlParams();
  const { user: userMetadata, loading } = useUserMetadata(userId);

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'organizations', real: true }], [url, paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <Grid container rowSpacing={4}>
      <Grid item xs={12}>
        <AssociatedOrganizationsView
          organizationNameIDs={userMetadata?.organizationNameIDs || []}
          title={t('pages.user-profile.associated-organizations.title')}
          helpText={t('pages.user-profile.associated-organizations.help')}
          loading={loading}
          dense
        />
      </Grid>
    </Grid>
  );
};
export default UserOrganizationsPage;
