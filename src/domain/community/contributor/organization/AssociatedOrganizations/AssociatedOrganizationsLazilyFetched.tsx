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
  organizationNameIDs: string[];
  enableLeave?: boolean;
}

interface OrganizationCardLazilyFetchedProps {
  nameID: string;
  enableLeave?: boolean;
}

const OrganizationCardLazilyFetched = ({ nameID, enableLeave }: OrganizationCardLazilyFetchedProps) => {
  return (
    <AssociatedOrganizationContainer
      organizationNameId={nameID}
      enableLeave={enableLeave}
      component={OrganizationCard}
    />
  );
};

export const AssociatedOrganizationsLazilyFetched: FC<AssociatedOrganizationsLazilyFetchedProps> = ({
  organizationNameIDs,
  enableLeave,
  ...viewProps
}) => {
  const organizations = organizationNameIDs.map(
    nameID => ({ key: nameID, nameID, enableLeave }),
    [organizationNameIDs]
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
