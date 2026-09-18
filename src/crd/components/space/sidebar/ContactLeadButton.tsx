import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type ContactLeadButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Opens the "contact the Space's leads" dialog. */
export function ContactLeadButton({ onClick, className }: ContactLeadButtonProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Button variant="outline" className={cn('w-full gap-2 text-body-emphasis', className)} onClick={onClick}>
      <Mail className="w-4 h-4" aria-hidden="true" />
      {t('sidebar.contactLead')}
    </Button>
  );
}
