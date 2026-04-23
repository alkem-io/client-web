import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Label } from '@/crd/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';

export type SubspaceTemplateChoice = {
  id: string;
  name: string;
};

export type ChangeDefaultSubspaceTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Subspace templates the user can choose from. */
  templates: SubspaceTemplateChoice[];
  /** Currently-active default (selected on open). */
  currentTemplateId: string | undefined;
  /** Library href — user clicks this to jump to the Templates tab. */
  libraryHref: string;
  loading?: boolean;
  /** Commit — receives the chosen template id. */
  onSave: (templateId: string) => void;
  saving?: boolean;
};

/**
 * CRD equivalent of MUI `SelectDefaultSpaceTemplateDialog`. Same data shape,
 * same behavior: a required Category select populated with the space's subspace
 * templates, a link to the Templates library, and Cancel/Save actions.
 * Validation is intentionally minimal (required) to match the MUI contract —
 * the consumer is expected to disable the trigger button when there are no
 * templates available.
 */
export function ChangeDefaultSubspaceTemplateDialog({
  open,
  onOpenChange,
  templates,
  currentTemplateId,
  libraryHref,
  loading = false,
  onSave,
  saving = false,
}: ChangeDefaultSubspaceTemplateDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');

  const [selected, setSelected] = useState<string>(currentTemplateId ?? '');
  const [touched, setTouched] = useState(false);

  // Reseed whenever the dialog opens or the upstream default changes.
  useEffect(() => {
    if (open) {
      setSelected(currentTemplateId ?? templates[0]?.id ?? '');
      setTouched(false);
    }
  }, [open, currentTemplateId, templates]);

  const invalid = touched && !selected;
  const canSave = !!selected && !saving;

  const handleOpenChange = (next: boolean) => {
    if (saving) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg overflow-x-hidden [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>{t('subspaces.defaultTemplate.dialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 text-sm">
          <p>{t('subspaces.defaultTemplate.dialog.intro')}</p>
          <p>
            <Trans
              t={t}
              i18nKey="subspaces.defaultTemplate.dialog.description"
              defaults="Below you can choose between the Templates collected in the Space Template Library. If you're looking to create new Templates or explore additional Templates, <library>click here</library> to access this library."
              components={{
                library: (
                  <a href={libraryHref} className="underline text-primary hover:no-underline">
                    click here
                  </a>
                ),
              }}
            />
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subspace-default-template-select" className={invalid ? 'text-destructive' : undefined}>
              {t('subspaces.defaultTemplate.dialog.fieldLabel')}
            </Label>
            {loading ? (
              <div className="flex h-9 items-center rounded-md border px-3 text-muted-foreground text-sm gap-2">
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                {t('subspaces.defaultTemplate.dialog.loading')}
              </div>
            ) : (
              <Select
                value={selected}
                onValueChange={next => {
                  setSelected(next);
                  setTouched(true);
                }}
              >
                <SelectTrigger
                  id="subspace-default-template-select"
                  className={invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                  aria-invalid={invalid}
                >
                  <SelectValue placeholder={t('subspaces.defaultTemplate.dialog.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {t('subspaces.defaultTemplate.dialog.empty')}
                    </div>
                  )}
                  {templates.map(tmpl => (
                    <SelectItem key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {invalid && <p className="text-xs text-destructive">{t('subspaces.defaultTemplate.dialog.required')}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={saving}>
            {t('subspaces.defaultTemplate.dialog.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              setTouched(true);
              if (canSave) onSave(selected);
            }}
            disabled={!canSave}
            aria-busy={saving}
          >
            {saving ? (
              <>
                <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />
                {t('subspaces.defaultTemplate.dialog.saving')}
              </>
            ) : (
              t('subspaces.defaultTemplate.dialog.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
