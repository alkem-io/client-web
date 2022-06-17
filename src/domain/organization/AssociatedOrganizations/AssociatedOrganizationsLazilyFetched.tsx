import React, { FC } from 'react';
import AssociatedOrganizationsDashboardSection, {
  AssociatedOrganizationsDashboardSectionProps,
} from './AssociatedOrganizationsDashboardSection';
import OrganizationCard from '../../../components/composite/common/cards/Organization/OrganizationCard';
import AssociatedOrganizationContainer from './AssociatedOrganizationContainer';

interface AssociatedOrganizationsFetchingViewProps
  extends Omit<
    AssociatedOrganizationsDashboardSectionProps<
      OrganizationCardLazilyFetchedProps,
      OrganizationCardLazilyFetchedProps
    >,
    'organizations' | 'organizationCardComponent'
  > {
  organizationNameIDs: string[];
}

interface OrganizationCardLazilyFetchedProps {
  nameID: string;
}

const OrganizationCardLazilyFetched = ({ nameID }: OrganizationCardLazilyFetchedProps) => {
  return <AssociatedOrganizationContainer organizationNameId={nameID} component={OrganizationCard} />;
};

export const AssociatedOrganizationsLazilyFetched: FC<AssociatedOrganizationsFetchingViewProps> = ({
  organizationNameIDs,
  ...viewProps
}) => {
  const organizations = organizationNameIDs.map(nameID => ({ nameID }), [organizationNameIDs]);

  return (
    <AssociatedOrganizationsDashboardSection
      {...viewProps}
      organizations={organizations}
      organizationCardComponent={OrganizationCardLazilyFetched}
    />
  );
};

export default AssociatedOrganizationsLazilyFetched;
