import { LogIn, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';

export type AssociateActionKind = 'join' | 'apply' | 'login' | 'respond' | 'pending-application' | 'closed' | 'none';

export type OrganizationAssociateActionProps = {
  action: AssociateActionKind;
  /** Visible caption for the join variant — wired as the button's accessible description (FR-015). */
  helperText?: string;
  loading?: boolean;
  onJoin: () => void;
  onApply: () => void;
  onRespond: () => void;
  onLogin: () => void;
};

/**
 * The organization profile hero's single associate action — driven entirely by the
 * `action` prop the connector derives from the server's eligibility signal (D7/D15).
 * Renders nothing for `'none'`.
 */
export function OrganizationAssociateAction({
  action,
  helperText,
  loading = false,
  onJoin,
  onApply,
  onRespond,
  onLogin,
}: OrganizationAssociateActionProps) {
  const { t } = useTranslation('crd-profilePages');

  if (action === 'none') {
    return null;
  }

  if (action === 'closed') {
    return <p className="text-caption text-muted-foreground">{t('orgProfile.associate.closed')}</p>;
  }

  if (action === 'pending-application') {
    return (
      <Button type="button" variant="secondary" disabled={true} className="shadow-sm">
        {t('orgProfile.associate.pending')}
      </Button>
    );
  }

  if (action === 'join') {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          type="button"
          variant="default"
          className="shadow-sm gap-2"
          onClick={onJoin}
          disabled={loading}
          aria-busy={loading}
          aria-describedby={helperText ? 'org-associate-join-caption' : undefined}
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          {t('orgProfile.associate.join')}
        </Button>
        {helperText && (
          <p id="org-associate-join-caption" className="max-w-xs text-right text-caption text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }

  if (action === 'respond') {
    return (
      <Button type="button" variant="default" className="shadow-sm" onClick={onRespond} disabled={loading}>
        {t('orgProfile.associate.respond')}
      </Button>
    );
  }

  if (action === 'login') {
    return (
      <Button type="button" variant="secondary" className="shadow-sm gap-2" onClick={onLogin}>
        <LogIn className="w-4 h-4" aria-hidden="true" />
        {t('orgProfile.associate.applyLogin')}
      </Button>
    );
  }

  // action === 'apply'
  return (
    <Button
      type="button"
      variant="secondary"
      className="shadow-sm gap-2"
      onClick={onApply}
      disabled={loading}
      aria-busy={loading}
    >
      <UserPlus className="w-4 h-4" aria-hidden="true" />
      {t('orgProfile.associate.apply')}
    </Button>
  );
}
