import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import LicensePlansTable from '@/domain/platformAdmin/domain/space/AdminSpaceListPage/LicensePlansTable';
import AssignPlan from '@/domain/platformAdmin/domain/space/AdminSpaceListPage/AssignPlan';

type LicensePlanDialogProps = {
  accountId: string;
  activeLicensePlanIds: string[] | undefined;
  licensePlans:
    | {
        id: string;
        name: string;
        sortOrder: number;
      }[]
    | undefined;
  assignLicensePlan: (accountId: string, planId: string) => Promise<unknown>;
  revokeLicensePlan: (accountId: string, planId: string) => void;
  open: boolean;
  onClose: () => void;
};

const LicensePlanDialog = ({
  accountId,
  activeLicensePlanIds,
  licensePlans,
  assignLicensePlan,
  revokeLicensePlan,
  open,
  onClose,
}: LicensePlanDialogProps) => {
  const { t } = useTranslation();

  // Sort license plans by sortOrder
  const sortedLicensePlans = licensePlans?.slice().sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <DialogWithGrid open={open} onClose={onClose} aria-labelledby="license-plan-dialog">
      <DialogHeader id="license-plan-dialog" title={t('pages.admin.spaces.manageLicensePlans')} onClose={onClose} />
      <DialogContent>
        {sortedLicensePlans && (
          <LicensePlansTable
            activeLicensePlanIds={activeLicensePlanIds}
            licensePlans={sortedLicensePlans}
            onDelete={plan => revokeLicensePlan(accountId, plan.id)}
          />
        )}
        {sortedLicensePlans && (
          <AssignPlan
            onAssignPlan={licensePlanId => assignLicensePlan(accountId, licensePlanId)}
            licensePlans={sortedLicensePlans}
            activeLicensePlanIds={activeLicensePlanIds}
          />
        )}
      </DialogContent>
    </DialogWithGrid>
  );
};

export default LicensePlanDialog;
