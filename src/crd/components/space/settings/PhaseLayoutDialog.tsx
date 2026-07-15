import { LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';

export type PhaseLayoutValues = {
  descriptionCollapsed: boolean;
  showPublishDetails: boolean;
};

type PhaseLayoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Display name of the phase — shown in the dialog title for context. */
  phaseName: string;
  /** Current values pre-filled in the controls. */
  values: PhaseLayoutValues;
  /**
   * Persists the values when the admin clicks Save. May be async — the dialog awaits it
   * and only closes on success, so a failed save keeps the dialog open for retry rather
   * than silently discarding the edit.
   */
  onSave: (values: PhaseLayoutValues) => void | Promise<void>;
};

/**
 * Per-phase Layout modal (US3, FR-010/FR-011).
 * Presentational CRD component — no GraphQL or business logic inside.
 * Allows the admin to set:
 *   - "Description height": Expanded / Collapsed (shown as a Switch labeled "Collapse descriptions")
 *   - "Publisher & Date": On / Off (shown as a Switch labeled "Show publisher & date")
 *
 * Styling mirrors the existing `EditDetailsDialog` in `LayoutPoolColumn.tsx`.
 */
export function PhaseLayoutDialog({ open, onOpenChange, phaseName, values, onSave }: PhaseLayoutDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');

  const [descriptionCollapsed, setDescriptionCollapsed] = useState(values.descriptionCollapsed);
  const [showPublishDetails, setShowPublishDetails] = useState(values.showPublishDetails);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ descriptionCollapsed, showPublishDetails });
      onOpenChange(false);
    } catch {
      // Persistence failed — keep the dialog open so the admin can retry. Error surfacing
      // (toast) is handled by the consumer / Apollo error layer, not this presentational dialog.
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        // Don't allow closing (Esc / outside click) mid-save.
        if (!nextOpen && !saving) handleCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutDashboard aria-hidden="true" className="size-4" />
            {t('layout.column.phaseLayout.dialogTitle', { phaseName })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* Description height control */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="phase-description-height" className="text-body-emphasis cursor-pointer">
                {t('layout.column.phaseLayout.descriptionHeight.label')}
              </Label>
              <p className="text-caption text-muted-foreground">
                {descriptionCollapsed
                  ? t('layout.column.phaseLayout.descriptionHeight.collapsedHint')
                  : t('layout.column.phaseLayout.descriptionHeight.expandedHint')}
              </p>
            </div>
            <Switch
              id="phase-description-height"
              checked={descriptionCollapsed}
              onCheckedChange={setDescriptionCollapsed}
              aria-label={t('layout.column.phaseLayout.descriptionHeight.switchLabel')}
            />
          </div>

          {/* Publisher & Date control */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="phase-show-publish-details" className="text-body-emphasis cursor-pointer">
                {t('layout.column.phaseLayout.publishDetails.label')}
              </Label>
              <p className="text-caption text-muted-foreground">
                {showPublishDetails
                  ? t('layout.column.phaseLayout.publishDetails.onHint')
                  : t('layout.column.phaseLayout.publishDetails.offHint')}
              </p>
            </div>
            <Switch
              id="phase-show-publish-details"
              checked={showPublishDetails}
              onCheckedChange={setShowPublishDetails}
              aria-label={t('layout.column.phaseLayout.publishDetails.switchLabel')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleCancel} disabled={saving}>
            {t('layout.column.phaseLayout.cancel')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} aria-busy={saving}>
            {saving ? t('layout.column.phaseLayout.saving') : t('layout.column.phaseLayout.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
