import { useState } from 'react';
import {
  CreateSpaceDialog,
  type CreateSpaceFormValues,
  type CreateSpaceVisualConstraints,
} from '@/crd/components/space/CreateSpaceDialog';
import { Button } from '@/crd/primitives/button';

// Local mock slug derivation for the standalone preview only. The production flow uses
// `@/core/utils/nameId/createNameId`, but the demo app is part of the design system and its
// vite config only aliases `@/crd` — it cannot import from `@/core/**`. This self-contained
// approximation is purely to demo the name → slug auto-fill.
function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const EMPTY_VALUES: CreateSpaceFormValues = {
  displayName: '',
  nameId: '',
  tagline: '',
  description: '',
  tags: [],
  spaceTemplateId: '',
  bannerFile: null,
  cardBannerFile: null,
  addTutorialCallouts: false,
  acceptedTerms: false,
};

const BANNER_CONSTRAINTS: CreateSpaceVisualConstraints = {
  maxWidth: 1920,
  maxHeight: 640,
  minWidth: 384,
  minHeight: 128,
  aspectRatio: 3,
  allowedTypes: ['image/png', 'image/jpeg'],
};

const CARD_CONSTRAINTS: CreateSpaceVisualConstraints = {
  maxWidth: 640,
  maxHeight: 400,
  minWidth: 307,
  minHeight: 192,
  aspectRatio: 1.6,
  allowedTypes: ['image/png', 'image/jpeg'],
};

/**
 * Standalone preview for the CRD Create Space dialog (`pnpm crd:dev`). Drives the
 * pure component with local mock state — no backend, no Apollo, no template
 * picker query. Toggles let designers exercise the no-plan and submitting states.
 */
export function CreateSpacePage() {
  const [open, setOpen] = useState(true);
  const [values, setValues] = useState<CreateSpaceFormValues>(EMPTY_VALUES);
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [noPlan, setNoPlan] = useState(false);

  const canSubmit =
    values.displayName.trim().length >= 3 &&
    values.nameId.trim().length >= 3 &&
    values.acceptedTerms &&
    !noPlan &&
    !submitting;

  const handleChange = (patch: Partial<CreateSpaceFormValues>) => {
    setValues(prev => {
      const next = { ...prev, ...patch };
      if ('displayName' in patch && !slugEdited) {
        next.nameId = toSlug(patch.displayName ?? '');
      }
      return next;
    });
    if ('nameId' in patch) setSlugEdited(true);
  };

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-start gap-4">
      <h1 className="text-page-title">Create Space dialog — preview</h1>
      <p className="text-body text-muted-foreground max-w-prose">
        Mock-data preview of the CRD Create Space dialog. The page banner replaces the avatar, the markdown description
        is kept, and the form ends with the "Add Tutorials" and "Accept terms" checkboxes.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Button variant="outline" onClick={() => setNoPlan(prev => !prev)}>
          {noPlan ? 'Plan available' : 'Simulate no plan'}
        </Button>
      </div>

      <CreateSpaceDialog
        open={open}
        onOpenChange={setOpen}
        values={values}
        errors={{}}
        onOpenTemplatePicker={() => undefined}
        onClearTemplate={() => setValues(prev => ({ ...prev, spaceTemplateId: '' }))}
        bannerConstraints={BANNER_CONSTRAINTS}
        cardBannerConstraints={CARD_CONSTRAINTS}
        urlPrefix={`${window.location.origin}/`}
        submitting={submitting}
        canSubmit={canSubmit}
        noPlanAvailable={noPlan}
        onChange={handleChange}
        onSubmit={() => {
          setSubmitting(true);
          window.setTimeout(() => {
            setSubmitting(false);
            setOpen(false);
          }, 1200);
        }}
        onImageUpload={async file => URL.createObjectURL(file)}
        iframeAllowedUrls={[]}
        onError={() => undefined}
      />
    </div>
  );
}
