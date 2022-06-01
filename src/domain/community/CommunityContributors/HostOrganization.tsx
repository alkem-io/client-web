import { Accordion } from '../../../components/composite/common/Accordion/Accordion';
import ContributingOrganizations from './ContributingOrganizations';
import React, { useMemo } from 'react';
import { OrganizationCardProps } from '../../../components/composite/common/cards/Organization/OrganizationCard';
import { Identifiable } from '../../shared/types/Identifiable';
import { useTranslation } from 'react-i18next';

interface HostOrganizationProps {
  organization: (OrganizationCardProps & Identifiable) | undefined;
  loading?: boolean;
}

const HostOrganization = ({ organization, loading = false }: HostOrganizationProps) => {
  const { t } = useTranslation();

  const organizations = useMemo(() => organization && [organization], [organization]);

  return (
    <Accordion
      title={t('pages.community.hub-host.title')}
      helpText={t('pages.community.hub-host.help-text')}
      ariaKey="host-organization"
      loading={loading}
    >
      <ContributingOrganizations organizations={organizations} loading={loading} />
    </Accordion>
  );
};

export default HostOrganization;
