import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type SpaceVisibilityNoticeProps = {
  status: 'active' | 'archived' | 'demo' | 'inactive';
  contactHref?: string;
  className?: string;
};

export function SpaceVisibilityNotice({ status, contactHref, className }: SpaceVisibilityNoticeProps) {
  const { t } = useTranslation('crd-space');

  if (status === 'active') {
    return null;
  }

  const colorMap = {
    archived: 'bg-amber-50 text-amber-800 border-amber-200',
    demo: 'bg-blue-50 text-blue-800 border-blue-200',
    inactive: 'bg-gray-50 text-gray-800 border-gray-200',
  };

  const messageMap = {
    archived: t('visibility.archived'),
    demo: t('visibility.demo'),
    inactive: t('visibility.inactive'),
  };

  return (
    <output
      className={cn('flex items-center gap-2 px-4 py-3 border rounded-lg text-sm', colorMap[status], className)}
      aria-label={t('a11y.visibilityNotice')}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{messageMap[status]}</span>
      {status === 'archived' && contactHref && (
        <>
          {' '}
          <a href={contactHref} className="underline font-medium hover:no-underline">
            {t('visibility.archivedContact')}
          </a>
        </>
      )}
    </output>
  );
}
