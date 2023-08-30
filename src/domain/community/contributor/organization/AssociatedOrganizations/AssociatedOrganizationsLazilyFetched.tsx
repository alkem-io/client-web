import React, { FC } from 'react';
import AssociatedOrganizationsDashboardSection, {
  AssociatedOrganizationsDashboardSectionProps,
} from './AssociatedOrganizationsDashboardSection';
import OrganizationCard from '../OrganizationCard/OrganizationCard';
import AssociatedOrganizationContainer from './AssociatedOrganizationContainer';

interface AssociatedOrganizationsLazilyFetchedProps
  extends Omit<
    AssociatedOrganizationsDashboardSectionProps<
      OrganizationCardLazilyFetchedProps,
      OrganizationCardLazilyFetchedProps & { key: string }
    >,
    'organizations' | 'organizationCardComponent'
  > {
  organizationIds: string[];
  enableLeave?: boolean;
}

interface OrganizationCardLazilyFetchedProps {
  organizationId: string;
  enableLeave?: boolean;
}

const OrganizationCardLazilyFetched = ({ organizationId, enableLeave }: OrganizationCardLazilyFetchedProps) => {
  return (
    <AssociatedOrganizationContainer
      organizationId={organizationId}
      enableLeave={enableLeave}
      component={OrganizationCard}
    />
  );
};

export const AssociatedOrganizationsLazilyFetched: FC<AssociatedOrganizationsLazilyFetchedProps> = ({
  organizationIds,
  enableLeave,
  ...viewProps
}) => {
  const organizations = organizationIds.map(
    organizationId => ({ key: organizationId, organizationId, enableLeave }),
    [organizationIds]
  );

  return (
    <AssociatedOrganizationsDashboardSection
      {...viewProps}
      organizations={organizations}
      organizationCardComponent={OrganizationCardLazilyFetched}
    />
  );
};

export default AssociatedOrganizationsLazilyFetched;
