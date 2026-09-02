import { useState } from 'react';
import { CreateInnovationPackDialog } from '@/crd/components/innovationPack/CreateInnovationPackDialog';
import type { CreateInnovationPackErrors, CreateInnovationPackValues } from '@/crd/components/innovationPack/types';
import { Button } from '@/crd/primitives/button';

const EMPTY: CreateInnovationPackValues = { name: '', description: '' };

/**
 * Standalone preview for the CRD Create Innovation Pack dialog (`pnpm crd:dev`).
 * Drives the pure component with local mock state — no backend / Apollo. Live
 * validation (name 3–128, required markdown description) exercises the error state.
 */
export function CreateInnovationPackPage() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<CreateInnovationPackValues>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [withAccount, setWithAccount] = useState(false);

  const errors: CreateInnovationPackErrors = {};
  const name = value.name.trim();
  if (!name) errors.name = 'A name is required.';
  else if (name.length < 3) errors.name = 'Must be at least 3 characters.';
  else if (name.length > 128) errors.name = 'Must be at most 128 characters.';
  if (!value.description.trim()) errors.description = 'A description is required.';

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-start gap-4">
      <h1 className="text-page-title">Create Innovation Pack dialog — preview</h1>
      <p className="text-body text-muted-foreground max-w-prose">
        Mock-data preview of the CRD Create Innovation Pack dialog: name + required markdown description, the
        "save for more details" hint, and a sticky Create/Cancel footer.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Button variant="outline" onClick={() => setWithAccount(prev => !prev)}>
          {withAccount ? 'User account subtitle' : 'Organization account subtitle'}
        </Button>
      </div>

      <CreateInnovationPackDialog
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
