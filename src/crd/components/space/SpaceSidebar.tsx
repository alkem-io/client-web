import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type SpaceSidebarProps = {
  /** Widget sections in the order they should render — the consumer resolves
   *  the tab's configured widget list into this ordered children list. */
  children?: ReactNode;
  className?: string;
};

/** Nav shell for a Space tab's sidebar — purely the frame; every widget is
 *  supplied by the consumer as an ordered child (config-driven composition). */
export function SpaceSidebar({ children, className }: SpaceSidebarProps) {
  const { t } = useTranslation('crd-space');

  return (
    <nav className={cn('space-y-6 w-full', className)} aria-label={t('a11y.sidebarNavigation')}>
      {children}
    </nav>
  );
}
