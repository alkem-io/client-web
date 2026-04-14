import { BookOpen, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type CommunityGuidelinesSectionProps = {
  guidelines: string[];
  className?: string;
};

export function CommunityGuidelinesSection({ guidelines, className }: CommunityGuidelinesSectionProps) {
  const { t } = useTranslation('crd-space');

  if (guidelines.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <h3 className="uppercase tracking-wider text-[11px] font-semibold text-muted-foreground">
          {t('sidebar.communityGuidelines')}
        </h3>
      </div>
      <ul className="space-y-2.5 px-1">
        {guidelines.map(guideline => (
          <li key={guideline} className="flex items-start gap-2.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-600" aria-hidden="true" />
            <span className="text-sm text-muted-foreground leading-relaxed">{guideline}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
