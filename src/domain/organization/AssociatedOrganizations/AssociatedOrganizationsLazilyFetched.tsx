import React, { FC } from 'react';
import AssociatedOrganizationsView, { AssociatedOrganizationsViewProps } from './AssociatedOrganizationsView';
import OrganizationCard from '../../../components/composite/common/cards/Organization/OrganizationCard';
import AssociatedOrganizationContainer from './AssociatedOrganizationContainer';

interface AssociatedOrganizationsFetchingViewProps
  extends Omit<
    AssociatedOrganizationsViewProps<OrganizationCardLazilyFetchedProps, OrganizationCardLazilyFetchedProps>,
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
    <AssociatedOrganizationsView
      {...viewProps}
      organizations={organizations}
      organizationCardComponent={OrganizationCardLazilyFetched}
    />
  );
};

export default AssociatedOrganizationsLazilyFetched;
