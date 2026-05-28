import { useState } from 'react';
import { InnovationPackProfileView } from '@/crd/components/innovationPack/InnovationPackProfileView';
import { TemplatePreviewDialog } from '@/crd/components/templates/TemplatePreviewDialog';
import type { TemplateContent } from '@/crd/components/templates/types';
import { Button } from '@/crd/primitives/button';
import {
  MOCK_ALL_TEMPLATES,
  MOCK_PACK_PROFILE,
  MOCK_TEMPLATE_CATEGORIES,
  MOCK_TEMPLATE_CONTENT_BY_ID,
} from '../data/templates';

/**
 * Standalone preview for `InnovationPackProfileView` (T088) — the anonymous-accessible
 * pack public profile. Compact header (thumbnail / name / description / meta row) +
 * full-width read-only templates manager. Toggle the `canManage` knob to show/hide the
 * "Manage this pack" entry.
 */
export function InnovationPackProfilePage() {
  const [canManage, setCanManage] = useState(false);

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<TemplateContent | undefined>(undefined);

  const previewHeader = previewId ? MOCK_ALL_TEMPLATES.find(t => t.id === previewId) : undefined;

  const openPreview = (id: string) => {
    setPreviewId(id);
    setPreviewLoading(true);
    setPreviewContent(undefined);
    window.setTimeout(() => {
      setPreviewContent(MOCK_TEMPLATE_CONTENT_BY_ID[id]);
      setPreviewLoading(false);
    }, 350);
  };

  return (
    <div className="crd-root mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <header className="space-y-3">
        <div>
          <h1 className="text-page-title">Innovation Pack — public profile</h1>
          <p className="text-body text-muted-foreground">
            Mock preview of <code className="text-caption">InnovationPackProfileView</code>. Toggle the manage state to
            show/hide the "Manage this pack" entry point.
          </p>
        </div>
        <Button size="sm" variant={canManage ? 'default' : 'outline'} onClick={() => setCanManage(m => !m)}>
          {canManage ? 'canManage: true' : 'canManage: false'}
        </Button>
      </header>

      <InnovationPackProfileView
        pack={MOCK_PACK_PROFILE}
        templates={MOCK_TEMPLATE_CATEGORIES}
        canManage={canManage}
        adminHref={canManage ? `${MOCK_PACK_PROFILE.url}/settings` : undefined}
        onTemplatePreview={openPreview}
        shareUrl={MOCK_PACK_PROFILE.url}
      />

      {previewHeader && (
        <TemplatePreviewDialog
          open={previewId !== null}
          onClose={() => setPreviewId(null)}
          header={previewHeader}
          content={previewContent}
          contentLoading={previewLoading}
        />
      )}
    </div>
  );
}
