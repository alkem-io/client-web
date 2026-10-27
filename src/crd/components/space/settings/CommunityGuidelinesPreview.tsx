import { Link2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { CommunityGuidelinesEditorValue } from './CommunityGuidelinesEditor';

type CommunityGuidelinesPreviewProps = {
  value: CommunityGuidelinesEditorValue;
  loading?: boolean;
  onEdit: () => void;
};

/** Read-only rendering of the community guidelines (title, body, related links) with an Edit button. */
export function CommunityGuidelinesPreview({ value, loading, onEdit }: CommunityGuidelinesPreviewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const isEmpty = !value.title.trim() && !value.body.trim() && value.references.length === 0;

  return (
    <div className="space-y-3">
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : isEmpty ? (
        <p className="text-body text-muted-foreground">{t('community.guidelines.empty')}</p>
      ) : (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          {value.title.trim() && <h4 className="text-card-title">{value.title}</h4>}
          {value.body.trim() && <MarkdownContent content={value.body} className="text-body text-muted-foreground" />}
          {value.references.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-caption font-semibold text-muted-foreground">
                {t('community.guidelines.referencesLabel')}
              </p>
              <ul className="space-y-1">
                {value.references.map((reference, index) => (
                  <li key={reference.id ?? index} className="flex items-start gap-2">
                    <Link2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <a
                      href={reference.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="text-body text-primary underline-offset-4 hover:underline"
                    >
                      {reference.name || reference.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onEdit} disabled={loading}>
        <Pencil aria-hidden="true" className="size-4" />
        {t('community.guidelines.edit')}
      </Button>
    </div>
  );
}
