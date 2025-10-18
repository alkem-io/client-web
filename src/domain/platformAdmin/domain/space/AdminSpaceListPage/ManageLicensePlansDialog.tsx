import React from 'react';
import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  useSpaceSubscriptionsQuery,
  usePlatformLicensePlansQuery,
  useAssignLicensePlanToSpaceMutation,
  useRevokeLicensePlanFromSpaceMutation,
  refetchSpaceSubscriptionsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { LicensingCredentialBasedPlanType } from '@/core/apollo/generated/graphql-schema';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Loading from '@/core/ui/loading/Loading';
import LicensePlansTable, { LicensePlan } from './LicensePlansTable';
import AssignPlan from './AssignPlan';

interface ManageLicensePlansDialogProps {
  open: boolean;
  onClose: () => void;
  spaceId: string;
}

const ManageLicensePlansDialog = ({ open, onClose, spaceId }: ManageLicensePlansDialogProps) => {
  const { t } = useTranslation();

  // Fetch platform license plans once (globally cached, doesn't change)
  const { data: licensePlansData } = usePlatformLicensePlansQuery({
    fetchPolicy: 'cache-first', // Use cached data, this never changes
  });

  // Only fetch space-specific subscriptions when dialog is open
  const { data: subscriptionsData, loading } = useSpaceSubscriptionsQuery({
    variables: { spaceId },
    skip: !open,
    fetchPolicy: 'cache-and-network', // Always get fresh subscription data
  });

  const [assignLicensePlan] = useAssignLicensePlanToSpaceMutation({
    refetchQueries: [refetchSpaceSubscriptionsQuery({ spaceId })],
    awaitRefetchQueries: true,
  });

  const [revokeLicensePlan] = useRevokeLicensePlanFromSpaceMutation({
    refetchQueries: [refetchSpaceSubscriptionsQuery({ spaceId })],
    awaitRefetchQueries: true,
  });

  // Extract license plans relevant to spaces from the global platform data
  const allLicensePlans = licensePlansData?.platform.licensingFramework.plans ?? [];
  const spaceLicensePlans: LicensePlan[] = allLicensePlans
    .filter(
      plan =>
        plan.type === LicensingCredentialBasedPlanType.SpacePlan ||
        plan.type === LicensingCredentialBasedPlanType.SpaceFeatureFlag
    )
    .map(plan => ({
      id: plan.id,
      name: plan.name,
      sortOrder: plan.sortOrder,
    }));

  // Get active subscription names from the space-specific subscriptions data
  const activeSubscriptionNames =
    subscriptionsData?.lookup.space?.subscriptions.map(subscription => subscription.name) ?? [];

  // Match license plans with active subscriptions by comparing licenseCredential with subscription names
  const activeLicensePlanIds = allLicensePlans
    .filter(plan => activeSubscriptionNames.includes(plan.licenseCredential))
    .map(plan => plan.id);

  return (
    <DialogWithGrid open={open} onClose={onClose} aria-labelledby="manage-license-plans-dialog">
      <DialogHeader
        id="manage-license-plans-dialog"
        title={t('pages.admin.spaces.manageLicensePlans')}
        onClose={onClose}
      />
      <DialogContent>
        {loading ? (
          <Loading text="Loading license plans..." />
        ) : (
          <>
            <LicensePlansTable
              activeLicensePlanIds={activeLicensePlanIds}
              licensePlans={spaceLicensePlans}
              onDelete={plan => revokeLicensePlan({ variables: { spaceId, licensePlanId: plan.id } })}
            />
            <AssignPlan
              onAssignPlan={licensePlanId => assignLicensePlan({ variables: { spaceId, licensePlanId } })}
              licensePlans={spaceLicensePlans}
              activeLicensePlanIds={activeLicensePlanIds}
            />
          </>
        )}
      </DialogContent>
    </DialogWithGrid>
  );
};

export default ManageLicensePlansDialog;
