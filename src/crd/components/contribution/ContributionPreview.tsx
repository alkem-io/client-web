import { ChevronLeft, ChevronRight, Pencil, Share2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';

type ContributionPreviewProps = {
  title: string;
  author?: { name: string; avatarUrl?: string };
  timestamp?: string;
  children: React.ReactNode;
  canEdit?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
};

export function ContributionPreview({
  title,
  author,
  timestamp,
  children,
  canEdit,
  onEdit,
  onShare,
  onClose,
  onPrev,
  onNext,
  className,
}: ContributionPreviewProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('border border-border rounded-lg bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3 min-w-0">
          {author && (
            <Avatar className="w-8 h-8 shrink-0">
              {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
              <AvatarFallback className="text-xs">{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {author && <span>{author.name}</span>}
              {timestamp && <span>• {timestamp}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canEdit && onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              aria-label={t('contribution.edit')}
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          )}
          {onShare && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onShare}
              aria-label={t('contribution.share')}
            >
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
            aria-label={t('contribution.close')}
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>

      {/* Navigation */}
      {(onPrev || onNext) && (
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <Button variant="ghost" size="sm" disabled={!onPrev} onClick={onPrev}>
            <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
            {t('contribution.previous')}
          </Button>
          <Button variant="ghost" size="sm" disabled={!onNext} onClick={onNext}>
            {t('contribution.next')}
            <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
