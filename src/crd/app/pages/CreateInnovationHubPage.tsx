import { useState } from 'react';
import { CreateInnovationHubDialog } from '@/crd/components/innovationHub/CreateInnovationHubDialog';
import type {
  CreateInnovationHubErrors,
  CreateInnovationHubValues,
} from '@/crd/components/innovationHub/createInnovationHub.types';
import { Button } from '@/crd/primitives/button';

const EMPTY: CreateInnovationHubValues = { subdomain: '', name: '', tagline: '', description: '' };

// Local mock validation for the standalone preview only. The production rules live in the
// integration layer (`src/main/crdPages/innovationHub/createInnovationHubSchema.ts`); the demo
// app is part of the design system and MUST NOT import from `@/main/**`, so this is a small,
// self-contained copy purely to exercise the dialog's error states.
function mockValidate(value: CreateInnovationHubValues): CreateInnovationHubErrors {
  const errors: CreateInnovationHubErrors = {};
  const subdomain = value.subdomain.trim();
  if (!subdomain) errors.subdomain = 'A subdomain is required.';
  else if (!/^[a-z0-9-]*$/.test(subdomain)) errors.subdomain = 'Only lowercase letters, numbers and hyphens are allowed.';
  else if (subdomain.length < 3) errors.subdomain = 'Must be at least 3 characters.';
  else if (subdomain.length > 25) errors.subdomain = 'Must be at most 25 characters.';

  const name = value.name.trim();
  if (!name) errors.name = 'A name is required.';
  else if (name.length < 3) errors.name = 'Must be at least 3 characters.';
  else if (name.length > 128) errors.name = 'Must be at most 128 characters.';

  if (value.tagline.length > 512) errors.tagline = 'Must be at most 512 characters.';
  if (!value.description.trim()) errors.description = 'A description is required.';
  return errors;
}

/**
 * Standalone preview for the CRD Create Innovation Hub dialog (`pnpm crd:dev`).
 * Drives the pure component with local mock state + local mock validation — no
 * backend, no Apollo, and no imports from the integration layer.
 */
export function CreateInnovationHubPage() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<CreateInnovationHubValues>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [withAccount, setWithAccount] = useState(false);

  const errors = mockValidate(value);

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-start gap-4">
      <h1 className="text-page-title">Create Innovation Hub dialog — preview</h1>
      <p className="text-body text-muted-foreground max-w-prose">
        Mock-data preview of the CRD Create Innovation Hub dialog: subdomain (format-validated), name, tagline, and a
        required markdown description, with the "save for more details" hint.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Button variant="outline" onClick={() => setWithAccount(prev => !prev)}>
          {withAccount ? 'User account subtitle' : 'Organization account subtitle'}
        </Button>
      </div>

      <CreateInnovationHubDialog
        open={open}
        onClose={() => setOpen(false)}
        value={value}
        errors={errors}
        onChange={setValue}
        creating={submitting}
        canSubmit={Object.keys(errors).length === 0 && !submitting}
        accountName={withAccount ? 'Acme Org' : undefined}
        onCreate={() => {
          setSubmitting(true);
          window.setTimeout(() => {
            setSubmitting(false);
            setOpen(false);
            setValue(EMPTY);
          }, 1200);
        }}
        onImageUpload={async file => URL.createObjectURL(file)}
        iframeAllowedUrls={[]}
        onError={() => undefined}
      />
    </div>
  );
}
