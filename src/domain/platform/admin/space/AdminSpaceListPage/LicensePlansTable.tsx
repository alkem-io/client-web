import DataGridTable from '@/core/ui/table/DataGridTable';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';
import ConfirmationDialog from '@/_deprecatedToKeep/ConfirmationDialog';

export interface LicensePlan {
  id: string;
  name: string;
}
type RenderParams = GridRenderCellParams<LicensePlan>;
type GetterParams = LicensePlan | undefined;

interface LicensePlansTableProps {
  activeLicensePlanIds: string[] | undefined;
  licensePlans: LicensePlan[];
  onDelete?: (plan: LicensePlan) => void;
}

const LicensePlansTable = ({ licensePlans, activeLicensePlanIds = [], onDelete }: LicensePlansTableProps) => {
  const isLicensePlanActive = (plan: GetterParams) => (plan?.id ? activeLicensePlanIds.includes(plan.id) : false);

  const columns: GridColDef<LicensePlan>[] = [
    {
      headerName: 'Active',
      field: 'isActive',
      valueGetter: (row: GetterParams) => isLicensePlanActive(row),
      renderCell: ({ row }: RenderParams) => (isLicensePlanActive(row) ? <CheckIcon /> : <></>),
    },
    {
      field: 'name',
    },
  ];

  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const deletingPlan = licensePlans.find(plan => plan.id === deletingPlanId);

  const handleDelete = () => {
    onDelete?.(deletingPlan!);
    setDeletingPlanId(null);
  };

  return (
    <>
      <DataGridTable
        rows={licensePlans}
        columns={columns}
        disableDelete={plan => !isLicensePlanActive(plan)}
        onDelete={plan => setDeletingPlanId(plan.id)}
        dependencies={[activeLicensePlanIds]}
        flex={{ isActive: 0 }}
        hideFooter
      />
      <ConfirmationDialog
        entities={{
          title: 'Revoke Plan',
          content: `You're about to revoke License Plan ${deletingPlan?.name} from the Space account. Are you sure you want to proceed?`,
          confirmButtonText: 'Revoke Plan',
        }}
        actions={{
          onConfirm: handleDelete,
          onCancel: () => setDeletingPlanId(null),
        }}
        options={{
          show: !!deletingPlanId,
        }}
      />
    </>
  );
};

export default LicensePlansTable;
