import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';

type SessionStoreUnavailableNoticeProps = { busy: boolean; onRetry: () => void };

export function SessionStoreUnavailableNotice({ busy, onRetry }: SessionStoreUnavailableNoticeProps) {
  const { t } = useTranslation('crd-common');
  return (
    <div
      role="alert"
      className="crd-root flex flex-wrap items-center gap-3 border-b border-amber-200 bg-amber-50 p-4 text-body text-amber-800"
    >
      <p>{t('apollo.errors.network.session_store_unavailable')}</p>
      <Button type="button" variant="outline" disabled={busy} aria-busy={busy} onClick={onRetry}>
        {t('apollo.errors.network.retry')}
      </Button>
    </div>
  );
}
