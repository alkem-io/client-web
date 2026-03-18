import type { Identifiable } from '@/core/utils/Identifiable';
import AssociatedOrganizationCard from './AssociatedOrganizationCard';
import AssociatedOrganizationsDashboardSection, {
  type AssociatedOrganizationsDashboardSectionProps,
} from './AssociatedOrganizationsDashboardSection';
import useAssociatedOrganization from './useAssociatedOrganization';

interface AssociatedOrganizationsLazilyFetchedProps
  extends Omit<
    AssociatedOrganizationsDashboardSectionProps<
      OrganizationCardLazilyFetchedProps,
      OrganizationCardLazilyFetchedProps & Identifiable
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
  const provided = useAssociatedOrganization({ organizationId, enableLeave });

  return <AssociatedOrganizationCard {...provided} />;
};

export const AssociatedOrganizationsLazilyFetched = ({
  organizationIds,
  enableLeave,
  ...viewProps
}: AssociatedOrganizationsLazilyFetchedProps) => {
  const organizations = organizationIds.map(
    organizationId => ({ id: organizationId, organizationId, enableLeave }),
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
