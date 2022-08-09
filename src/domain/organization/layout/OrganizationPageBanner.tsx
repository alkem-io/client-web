import React, { FC } from 'react';
import { useOrganization } from '../../../hooks';
import PageBanner from '../../shared/components/PageHeader/PageBanner';

const OrganizationPageBanner: FC = () => {
  const { displayName, loading, organization } = useOrganization();

  return <PageBanner title={displayName} tagline={organization?.profile?.description} loading={loading} />;
};

export default OrganizationPageBanner;
