import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import type { VirtualContributorBadgeProps } from './VirtualContributorBadge.types';

/**
 * Indicator shown wherever a Virtual Contributor appears on a CRD contributor
 * surface (comment authors, contributor chips). Replaces the legacy MUI
 * `VirtualContributorLabel` chip. The "Virtual Contributor" term stays in
 * English per the platform glossary.
 */
export function VirtualContributorBadge({ label, size = 'sm', className }: VirtualContributorBadgeProps) {
  const { t } = useTranslation('crd-common');
  const text = label ?? t('virtualContributor');

  return (
    <Badge variant="secondary" className={cn('text-badge gap-1 px-1.5 py-0', size === 'sm' && 'h-[18px]', className)}>
      <Bot aria-hidden="true" />
      {text}
    </Badge>
  );
}
