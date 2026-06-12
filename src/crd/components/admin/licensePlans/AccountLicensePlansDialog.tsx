import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { type LicensePlanOption, ManageLicensePlans } from './ManageLicensePlans';

type AccountLicensePlansDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog title (e.g. the account owner's name). */
  title: string;
  description?: string;
  available: LicensePlanOption[];
  activePlanIds: string[];
  onAssign: (planId: string) => void;
  onRevoke: (planId: string) => void;
  loading?: boolean;
};

/**
 * Hosts `ManageLicensePlans` in a CRD dialog. Reused by the Spaces / Users /
 * Organizations admin sections to manage an account's license plans. Pure
 * presentation — the consumer wires the plan data and assign/revoke callbacks.
 */
export function AccountLicensePlansDialog({
  open,
  onOpenChange,
  title,
  description,
  available,
  activePlanIds,
  onAssign,
  onRevoke,
  loading,
}: AccountLicensePlansDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" {...(description ? {} : { 'aria-describedby': undefined })}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <ManageLicensePlans
          available={available}
          activePlanIds={activePlanIds}
          onAssign={onAssign}
          onRevoke={onRevoke}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
