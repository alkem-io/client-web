import {
  refetchSpaceSubscriptionsQuery,
  useAssignLicensePlanToSpaceMutation,
  usePlatformLicensePlansQuery,
  useRevokeLicensePlanFromSpaceMutation,
  useSpaceSubscriptionsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { LicensingCredentialBasedPlanType } from '@/core/apollo/generated/graphql-schema';
import { AccountLicensePlansDialog } from '@/crd/components/admin/licensePlans/AccountLicensePlansDialog';

type SpaceLicensePlansDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  title: string;
};

/**
 * Space-scoped license-plan manager. Wires the space-specific subscription
 * queries/mutations to the shared presentational `AccountLicensePlansDialog`.
 * Mirrors MUI's `ManageLicensePlansDialog` (space plans + feature flags;
 * active plans matched by `licenseCredential` against the space subscriptions).
 */
export function SpaceLicensePlansDialog({ open, onOpenChange, spaceId, title }: SpaceLicensePlansDialogProps) {
  const { data: licensePlansData } = usePlatformLicensePlansQuery({ fetchPolicy: 'cache-first' });
  const { data: subscriptionsData, loading } = useSpaceSubscriptionsQuery({
    variables: { spaceId },
    skip: !open || !spaceId,
    fetchPolicy: 'cache-and-network',
  });

  const [assignLicensePlan] = useAssignLicensePlanToSpaceMutation({
    refetchQueries: [refetchSpaceSubscriptionsQuery({ spaceId })],
    awaitRefetchQueries: true,
  });
  const [revokeLicensePlan] = useRevokeLicensePlanFromSpaceMutation({
    refetchQueries: [refetchSpaceSubscriptionsQuery({ spaceId })],
    awaitRefetchQueries: true,
  });

  const allPlans = licensePlansData?.platform.licensingFramework.plans ?? [];
  const available = allPlans
    .filter(
      plan =>
        plan.type === LicensingCredentialBasedPlanType.SpacePlan ||
        plan.type === LicensingCredentialBasedPlanType.SpaceFeatureFlag
    )
    .map(plan => ({ id: plan.id, name: plan.name }));

  const activeSubscriptionNames = subscriptionsData?.lookup.space?.subscriptions.map(sub => sub.name) ?? [];
  const activePlanIds = allPlans
    .filter(plan => activeSubscriptionNames.includes(plan.licenseCredential))
    .map(plan => plan.id);

  return (
    <AccountLicensePlansDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      available={available}
      activePlanIds={activePlanIds}
      loading={loading}
      onAssign={licensePlanId => {
        void assignLicensePlan({ variables: { spaceId, licensePlanId } });
      }}
      onRevoke={licensePlanId => {
        void revokeLicensePlan({ variables: { spaceId, licensePlanId } });
      }}
    />
  );
}
