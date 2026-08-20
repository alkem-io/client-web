import { ChevronDown, ChevronUp, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Checkbox } from '@/crd/primitives/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';
import { SIDEBAR_WIDGET_IDS, type SidebarWidgetId } from './SpaceSettingsLayoutView.types';

export type PhaseLayoutValues = {
  descriptionCollapsed: boolean;
  showPublishDetails: boolean;
  /** Ordered sidebar widgets configured for this phase/tab. May be empty. */
  sidebar: SidebarWidgetId[];
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
  const [sidebar, setSidebar] = useState<SidebarWidgetId[]>(values.sidebar);
  const [saving, setSaving] = useState(false);

  const toggleWidget = (widgetId: SidebarWidgetId) => {
    setSidebar(prev => (prev.includes(widgetId) ? prev.filter(id => id !== widgetId) : [...prev, widgetId]));
  };

  const moveWidget = (widgetId: SidebarWidgetId, direction: -1 | 1) => {
    setSidebar(prev => {
      const index = prev.indexOf(widgetId);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const unselectedWidgets = SIDEBAR_WIDGET_IDS.filter(widgetId => !sidebar.includes(widgetId));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ descriptionCollapsed, showPublishDetails, sidebar });
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
      <DialogContent className="sm:max-w-lg">
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

          {/* Sidebar widgets — full vocabulary, selected first in saved order */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <Label className="text-body-emphasis">{t('layout.column.sidebarDialog.title')}</Label>
              <p className="text-caption text-muted-foreground">{t('layout.column.sidebarDialog.help')}</p>
            </div>

            {sidebar.length === 0 && (
              <p className="text-caption text-muted-foreground">{t('layout.column.sidebarDialog.emptyNote')}</p>
            )}

            {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
            {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
            <ul role="list" className="flex flex-col gap-1 max-h-64 overflow-y-auto">
              {sidebar.map((widgetId, index) => {
                const widgetLabel = t(`layout.column.sidebarDialog.widgets.${widgetId}`);
                return (
                  <li key={widgetId} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
                    <Checkbox
                      id={`sidebar-widget-${widgetId}`}
                      checked={true}
                      onCheckedChange={() => toggleWidget(widgetId)}
                      aria-label={t('layout.column.sidebarDialog.toggleAriaLabel', { widget: widgetLabel })}
                    />
                    <Label htmlFor={`sidebar-widget-${widgetId}`} className="flex-1 cursor-pointer text-body">
                      {widgetLabel}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      disabled={index === 0}
                      onClick={() => moveWidget(widgetId, -1)}
                      aria-label={t('layout.column.sidebarDialog.moveUpAriaLabel', { widget: widgetLabel })}
                    >
                      <ChevronUp className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      disabled={index === sidebar.length - 1}
                      onClick={() => moveWidget(widgetId, 1)}
                      aria-label={t('layout.column.sidebarDialog.moveDownAriaLabel', { widget: widgetLabel })}
                    >
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                );
              })}
              {unselectedWidgets.map(widgetId => {
                const widgetLabel = t(`layout.column.sidebarDialog.widgets.${widgetId}`);
                return (
                  <li key={widgetId} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
                    <Checkbox
                      id={`sidebar-widget-${widgetId}`}
                      checked={false}
                      onCheckedChange={() => toggleWidget(widgetId)}
                      aria-label={t('layout.column.sidebarDialog.toggleAriaLabel', { widget: widgetLabel })}
                    />
                    <Label
                      htmlFor={`sidebar-widget-${widgetId}`}
                      className="flex-1 cursor-pointer text-body text-muted-foreground"
                    >
                      {widgetLabel}
                    </Label>
                  </li>
                );
              })}
            </ul>
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
