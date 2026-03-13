import { GridLegacy, Skeleton } from '@mui/material';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { Identifiable } from '@/core/utils/Identifiable';

export interface AssociatedOrganizationsViewProps<Consumed extends {}, Organization extends Consumed & Identifiable> {
  organizations: Organization[] | undefined;
  dense?: boolean;
  loading?: boolean;
  entityName: string;
  organizationCardComponent: (organization: Consumed) => ReactElement | null;
}

const SkeletonItem = (props: { dense: boolean }) => (
  <GridLegacy item={true} xs={12} md={props.dense ? 6 : 12}>
    <Skeleton variant="rectangular" sx={{ height: theme => theme.spacing(8) }} />
  </GridLegacy>
);

export const AssociatedOrganizationsView = <Consumed extends {}, Organization extends Consumed & Identifiable>({
  organizations,
  dense = false,
  loading,
  entityName,
  organizationCardComponent: OrganizationCardComponent,
}: AssociatedOrganizationsViewProps<Consumed, Organization>) => {
  const { t } = useTranslation();

  return (
    <GridLegacy container={true} spacing={1}>
      {loading && <SkeletonItem dense={true} />}
      {!loading &&
        organizations?.map(org => (
          <GridLegacy key={org.id} item={true} xs={12} md={dense ? 6 : 12}>
            <OrganizationCardComponent {...org} key={org.id} />
          </GridLegacy>
        ))}
      {organizations?.length === 0 && (
        <GridLegacy item={true} xs={12} md={dense ? 6 : 12}>
          {t('associated-organizations-view.no-data', { name: entityName })}{' '}
        </GridLegacy>
      )}
    </GridLegacy>
  );
};

export default AssociatedOrganizationsView;
