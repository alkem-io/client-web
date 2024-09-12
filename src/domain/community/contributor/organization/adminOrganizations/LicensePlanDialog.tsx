import React from 'react';
import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';

import PlansTable from '../../../../platform/admin/space/AdminSpaceListPage/PlansTable';
import AssignPlan from '../../../../platform/admin/space/AdminSpaceListPage/AssignPlan';

interface LicensePlanDialogProps {
  entityId: string;
  activeLicensePlanIds: string[] | undefined;
  licensePlans:
    | {
        id: string;
        name: string;
      }[]
    | undefined;
  assignLicensePlan: (entityId: string, planId: string) => Promise<unknown>;
  revokeLicensePlan: (entityId: string, planId: string) => void;
  open: boolean;
  onClose: () => void;
}

const LicensePlanDialog = ({
  entityId,
  activeLicensePlanIds,
  licensePlans,
  assignLicensePlan,
  revokeLicensePlan,
  open,
  onClose,
}: LicensePlanDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} onClose={onClose}>
      <DialogHeader title={t('pages.admin.spaces.manageLicensePlans')} onClose={onClose} />
      <DialogContent>
        {licensePlans && (
          <PlansTable
            activeLicensePlanIds={activeLicensePlanIds}
            licensePlans={licensePlans}
            onDelete={plan => revokeLicensePlan(entityId, plan.id)}
          />
        )}
        {licensePlans && (
          <AssignPlan
            onAssignPlan={licensePlanId => assignLicensePlan(entityId, licensePlanId)}
            licensePlans={licensePlans}
          />
        )}
      </DialogContent>
    </DialogWithGrid>
  );
};

export default LicensePlanDialog;
