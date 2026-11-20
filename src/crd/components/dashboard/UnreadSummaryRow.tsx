import { Bell, ChevronRight, MessageCircle } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

type UnreadSummaryRowProps = {
  kind: 'messages' | 'notifications';
  count: number;
  onOpen: () => void;
};

/** Phone-only Home row: one unread count that opens the chat list or the notifications panel. */
export function UnreadSummaryRow({ kind, count, onOpen }: UnreadSummaryRowProps) {
  const { t } = useTranslation('crd-dashboard');

  if (count <= 0) return null;

  const Icon = kind === 'messages' ? MessageCircle : Bell;

  return (
    <section className="md:hidden space-y-2.5">
      <h2 className="text-subsection-title">{t(`unreadSummary.${kind}.heading`)}</h2>
      <button
        type="button"
        onClick={onOpen}
        aria-label={t(`unreadSummary.${kind}.ariaLabel`, { count })}
        className="flex w-full min-h-16 items-center gap-3 rounded-lg border border-border bg-card py-3 pl-3 pr-2 text-left text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className="relative flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
          aria-hidden="true"
        >
          <Icon className="size-5" />
          <span className="absolute top-px right-px size-2.5 rounded-full border-2 border-card bg-destructive" />
        </span>
        <span className="min-w-0 flex-1 text-body">
          <Trans
            t={t}
            i18nKey={`unreadSummary.${kind}.text`}
            count={count}
            components={{ b: <strong className="font-semibold" /> }}
          />
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </section>
  );
}
