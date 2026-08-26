import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type InviteButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Opens the member/virtual-contributor invite flow. */
export function InviteButton({ onClick, className }: InviteButtonProps) {
  const { t } = useTranslation('crd-space');

  return (
    // Force explicit colors — the default `bg-primary text-primary-foreground`
    // pair rendered as dark-on-dark in the community sidebar. Setting
    // `bg-primary` and `!text-white` with a `!` to win any cascade keeps the
    // label legible regardless of ancestor `.dark` contexts or token
    // redefinitions.
    <Button
      className={cn('w-full gap-2 text-body-emphasis bg-primary !text-white hover:bg-primary/90', className)}
      onClick={onClick}
    >
      <UserPlus className="w-4 h-4" aria-hidden="true" />
      {t('sidebar.invite')}
    </Button>
  );
}
