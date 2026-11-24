import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import type { ChatPresence } from './types';

// Each state has its own shape, so none reads by colour alone: online is a full
// dot, away is half filled, offline is a hollow ring.
const DOT_CLASS = {
  online: 'bg-emerald-500',
  away: 'overflow-hidden border-2 border-amber-500 bg-amber-500',
  offline: 'border-2 border-muted-foreground bg-card',
} as const;

type PresenceIndicatorProps = {
  presence?: ChatPresence;
};

/**
 * The availability dot on an avatar's bottom-right corner; the avatar's wrapper
 * must be `relative`. It is labelled and shaped per state, so it never relies on colour alone, and
 * it renders nothing when the availability is unknown.
 */
export function PresenceIndicator({ presence }: PresenceIndicatorProps) {
  const { t } = useTranslation('crd-chat');
  if (!presence || presence === 'unknown') {
    return null;
  }
  return (
    <span
      role="img"
      aria-label={t(`presence.${presence}` as 'presence.online')}
      className={cn('absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-card', DOT_CLASS[presence])}
    >
      {presence === 'away' && <span className="absolute inset-y-0 right-0 w-1/2 bg-card" />}
    </span>
  );
}
