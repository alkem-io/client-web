import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolvedPath } from 'react-router-dom';
import { useUrlParams, useUpdateNavigation } from '../../../hooks';
import { PageProps } from '../../../pages';
import AssociatedOrganizationsLazilyFetched from '../../organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import { useUserMetadata } from '../hooks/useUserMetadata';

export interface UserOrganizationsPageProps extends PageProps {}

const UserOrganizationsPage: FC<UserOrganizationsPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { pathname: url } = useResolvedPath('.');
  const { userNameId = '' } = useUrlParams();
  const { user: userMetadata, loading } = useUserMetadata(userNameId);

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'organizations', real: true }], [url, paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <Grid container rowSpacing={4}>
      <Grid item xs={12}>
        <AssociatedOrganizationsLazilyFetched
          canCreateOrganization={userMetadata?.permissions?.canCreateOrganization}
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
