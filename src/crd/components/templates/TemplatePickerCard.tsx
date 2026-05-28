import { Check, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { TYPE_ICON } from './TemplateCard';
import type { TemplateCardData } from './types';

export type TemplatePickerCardProps = {
  template: TemplateCardData;
  selected?: boolean;
  /** Open the preview pane for this template. */
  onPreview: (id: string) => void;
} & (
  | {
      mode: 'select';
      onSelect: (id: string) => void;
    }
  | {
      mode: 'import';
      alreadyInSet: boolean;
      onImport: (id: string) => void;
      onRemove: (id: string) => void;
    }
);

export function TemplatePickerCard(props: TemplatePickerCardProps) {
  const { t } = useTranslation('crd-templates');
  const { template, selected, onPreview } = props;
  const TypeIcon = TYPE_ICON[template.type];

  return (
    <div
      className={cn(
        'flex flex-col border rounded-lg overflow-hidden bg-card transition-shadow hover:shadow-sm',
        selected && 'ring-2 ring-ring'
      )}
    >
      <button
        type="button"
        onClick={() => onPreview(template.id)}
        className="relative aspect-video w-full overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${t('card.preview')}: ${template.name}`}
        aria-pressed={selected}
      >
        {template.bannerUrl ? (
          <img src={template.bannerUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="size-full flex items-center justify-center" style={backgroundGradient(template.color)}>
            <TypeIcon aria-hidden="true" className="size-8 text-white/70" />
          </div>
        )}
      </button>
      <div className="flex-1 p-3 flex flex-col gap-2">
        <div className="min-w-0">
          <p className="text-card-title truncate">{template.name}</p>
          {template.description && (
            <InlineMarkdown
              content={template.description}
              clampLines={2}
              className="text-caption text-muted-foreground"
            />
          )}
          {template.ownerLabel && <p className="text-caption text-muted-foreground truncate">{template.ownerLabel}</p>}
        </div>
        <div className="mt-auto flex items-center gap-2">
          {props.mode === 'select' ? (
            <Button
              size="sm"
              variant={selected ? 'default' : 'outline'}
              className="w-full"
              onClick={() => props.onSelect(template.id)}
            >
              {selected && <Check aria-hidden="true" className="size-4 mr-1.5" />}
              {t('picker.select')}
            </Button>
          ) : props.alreadyInSet ? (
            <>
              <Badge variant="secondary" className="text-badge gap-1">
                <Check aria-hidden="true" className="size-3" />
                {t('picker.inThisSet')}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-destructive focus:text-destructive"
                onClick={() => props.onRemove(template.id)}
              >
                <X aria-hidden="true" className="size-4 mr-1.5" />
                {t('picker.remove')}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" className="w-full" onClick={() => props.onImport(template.id)}>
              <Plus aria-hidden="true" className="size-4 mr-1.5" />
              {t('picker.import')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
