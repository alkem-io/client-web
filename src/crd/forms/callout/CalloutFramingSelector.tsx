import { BarChart3, FileText, Image, Link as LinkIcon, Presentation, StickyNote } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type FramingType = 'none' | 'whiteboard' | 'memo' | 'link' | 'media' | 'poll';

type CalloutFramingSelectorProps = {
  value: FramingType;
  onChange: (type: FramingType) => void;
  disabled?: boolean;
  className?: string;
};

const framingOptions: Array<{ type: FramingType; icon: ReactNode; labelKey: string }> = [
  { type: 'none', icon: <FileText className="w-5 h-5" aria-hidden="true" />, labelKey: 'callout.post' },
  { type: 'whiteboard', icon: <Presentation className="w-5 h-5" aria-hidden="true" />, labelKey: 'callout.whiteboard' },
  { type: 'memo', icon: <StickyNote className="w-5 h-5" aria-hidden="true" />, labelKey: 'callout.memo' },
  { type: 'link', icon: <LinkIcon className="w-5 h-5" aria-hidden="true" />, labelKey: 'callout.link' },
  { type: 'media', icon: <Image className="w-5 h-5" aria-hidden="true" />, labelKey: 'callout.mediaGallery' },
  { type: 'poll', icon: <BarChart3 className="w-5 h-5" aria-hidden="true" />, labelKey: 'callout.poll' },
];

export function CalloutFramingSelector({ value, onChange, disabled, className }: CalloutFramingSelectorProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('space-y-2', className)}>
      <span className="text-label text-muted-foreground uppercase">{t('forms.framingType')}</span>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" role="radiogroup">
        {framingOptions.map(option => (
          <label
            key={option.type}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-caption font-medium transition-all cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
              value === option.type
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-border text-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name="framing-type"
              value={option.type}
              checked={value === option.type}
              disabled={disabled}
              onChange={() => !disabled && onChange(option.type)}
              className="sr-only"
            />
            {option.icon}
            <span>{t(option.labelKey as 'callout.post')}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
