import { useState } from 'react';
import {
  CommunityGuidelinesEditor,
  type CommunityGuidelinesEditorValue,
} from '@/crd/components/space/settings/CommunityGuidelinesEditor';
import { MOCK_COMMUNITY_GUIDELINES } from '../data/templates';

/**
 * Standalone preview for `CommunityGuidelinesEditor` (T088, FR-038) — the host
 * surface for both "Apply a template" and "Save as a template" entry points.
 *
 * The editor is controlled; this page wires the buffer + submit state locally.
 */
export function CommunityGuidelinesPage() {
  const [value, setValue] = useState<CommunityGuidelinesEditorValue>(MOCK_COMMUNITY_GUIDELINES);
  const [submitting, setSubmitting] = useState(false);

  const canSave = value.title.trim().length > 0;

  return (
    <div className="crd-root mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-page-title">Community guidelines editor</h1>
        <p className="text-body text-muted-foreground">
          Mock preview of <code className="text-caption">CommunityGuidelinesEditor</code> — the FR-038 host that
          delivers legacy parity (title + body + references) and exposes "Apply a template" / "Save as a template"
          entry points.
        </p>
      </header>

      <CommunityGuidelinesEditor
        value={value}
        loading={false}
        submitting={submitting}
        canSave={canSave}
        onChange={patch => setValue(prev => ({ ...prev, ...patch }))}
        onSave={() => {
          setSubmitting(true);
          window.setTimeout(() => setSubmitting(false), 800);
        }}
        onApplyTemplate={() => {
          // biome-ignore lint/suspicious/noConsole: standalone preview app.
          console.log('Apply a template — would open the templates picker.');
        }}
        onSaveAsTemplate={() => {
          // biome-ignore lint/suspicious/noConsole: standalone preview app.
          console.log('Save as a template — would open the create-template dialog pre-filled.');
        }}
      />
    </div>
  );
}
