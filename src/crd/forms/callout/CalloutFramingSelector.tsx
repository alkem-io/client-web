import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import {
  FileText,
  Presentation,
  StickyNote,
  Link as LinkIcon,
  Image,
  BarChart3,
} from 'lucide-react';
import type { ReactNode } from 'react';

type FramingType = 'none' | 'whiteboard' | 'memo' | 'link' | 'media' | 'poll';

type CalloutFramingSelectorProps = {
  value: FramingType;
  onChange: (type: FramingType) => void;
  disabled?: boolean;
  className?: string;
};

const framingOptions: Array<{ type: FramingType; icon: ReactNode; labelKey: string }> = [
  { type: 'none', icon: <FileText className="w-5 h-5" />, labelKey: 'callout.post' },
  { type: 'whiteboard', icon: <Presentation className="w-5 h-5" />, labelKey: 'callout.whiteboard' },
  { type: 'memo', icon: <StickyNote className="w-5 h-5" />, labelKey: 'callout.memo' },
  { type: 'link', icon: <LinkIcon className="w-5 h-5" />, labelKey: 'callout.link' },
  { type: 'media', icon: <Image className="w-5 h-5" />, labelKey: 'callout.mediaGallery' },
  { type: 'poll', icon: <BarChart3 className="w-5 h-5" />, labelKey: 'callout.poll' },
];

export function CalloutFramingSelector({ value, onChange, disabled, className }: CalloutFramingSelectorProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {t('forms.framingType')}
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" role="radiogroup">
        {framingOptions.map(option => (
          <button
            key={option.type}
            type="button"
            role="radio"
            aria-checked={value === option.type}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all',
              value === option.type
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-border text-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && onChange(option.type)}
          >
            {option.icon}
            <span>{t(option.labelKey as 'callout.post')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
