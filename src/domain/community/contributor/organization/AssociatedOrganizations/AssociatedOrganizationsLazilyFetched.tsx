import AssociatedOrganizationsDashboardSection, {
  AssociatedOrganizationsDashboardSectionProps,
} from './AssociatedOrganizationsDashboardSection';
import AssociatedOrganizationContainer from './AssociatedOrganizationContainer';
import AssociatedOrganizationCard from './AssociatedOrganizationCard';

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
      component={AssociatedOrganizationCard}
    />
  );
};

export const AssociatedOrganizationsLazilyFetched = ({
  organizationIds,
  enableLeave,
  ...viewProps
}: AssociatedOrganizationsLazilyFetchedProps) => {
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
