import { ExternalLink, Pencil, Shield } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';

type GuidelinesReference = {
  name: string;
  uri: string;
  description?: string;
};

type CommunityGuidelinesBlockProps = {
  displayName?: string;
  description?: string;
  references?: GuidelinesReference[];
  loading?: boolean;
  canEdit?: boolean;
  onEditClick?: () => void;
  className?: string;
};

export function CommunityGuidelinesBlock({
  displayName,
  description,
  references,
  loading,
  canEdit,
  onEditClick,
  className,
}: CommunityGuidelinesBlockProps) {
  const { t } = useTranslation('crd-space');
  const [readMoreOpen, setReadMoreOpen] = useState(false);

  const hasContent = !!description || (references && references.length > 0);

  // Empty state, no edit privilege → omit entirely
  if (!hasContent && !canEdit) {
    return null;
  }

  const title = displayName ?? t('about.guidelines');

  if (loading) {
    return (
      <section className={cn('space-y-3', className)}>
        <Header title={title} icon={<Shield className="w-5 h-5 text-primary" aria-hidden="true" />} />
        <div className="h-8 animate-pulse bg-muted rounded" />
      </section>
    );
  }

  // Empty + can edit → admins-only caption + edit pencil
  if (!hasContent && canEdit) {
    return (
      <section className={cn('space-y-3', className)}>
        <Header
          title={title}
          icon={<Shield className="w-5 h-5 text-primary" aria-hidden="true" />}
          canEdit={canEdit}
          onEditClick={onEditClick}
          editLabel={t('about.edit')}
        />
        <p className="text-sm text-muted-foreground">{t('about.guidelinesAdminsOnly')}</p>
      </section>
    );
  }

  return (
    <section className={cn('space-y-3', className)}>
      <Header
        title={title}
        icon={<Shield className="w-5 h-5 text-primary" aria-hidden="true" />}
        canEdit={canEdit}
        onEditClick={onEditClick}
        editLabel={t('about.edit')}
      />

      {description && (
        <div className="relative max-h-32 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
          <MarkdownContent content={description} />
        </div>
      )}

      <Button type="button" variant="link" className="px-0 h-auto" onClick={() => setReadMoreOpen(true)}>
        {t('about.readMore')}
      </Button>

      <Dialog open={readMoreOpen} onOpenChange={setReadMoreOpen}>
        <DialogContent className="w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {description && <MarkdownContent content={description} />}
          {references && references.length > 0 && (
            <div className="space-y-2 mt-4">
              {references.map(ref => (
                <a
                  key={ref.uri}
                  href={ref.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{ref.name}</p>
                    {ref.description && <p className="text-xs text-muted-foreground">{ref.description}</p>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Header({
  title,
  icon,
  canEdit,
  onEditClick,
  editLabel,
}: {
  title: string;
  icon: React.ReactNode;
  canEdit?: boolean;
  onEditClick?: () => void;
  editLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {canEdit && onEditClick && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEditClick}
          aria-label={editLabel ?? 'Edit'}
          className="-mr-2"
        >
          <Pencil className="w-4 h-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
