import { PhoneIncoming, PhoneMissed, PhoneOutgoing } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import type { ChatCallKind } from './types';

const ICONS = { outgoing: PhoneOutgoing, incoming: PhoneIncoming, missed: PhoneMissed } as const;

/** The icon a call entry shows, also used by the conversation list preview. */
export function ChatCallIcon({ kind, className }: { kind: ChatCallKind; className?: string }) {
  const Icon = ICONS[kind];
  return <Icon aria-hidden="true" className={cn('shrink-0', kind === 'missed' && 'text-destructive', className)} />;
}

type ChatCallEntryProps = {
  kind: ChatCallKind;
  /** The call's time, already formatted for the thread. */
  time: string;
};

/** A call in the thread, in place of a message bubble: a centred row with the call's wording and time. */
export function ChatCallEntry({ kind, time }: ChatCallEntryProps) {
  const { t } = useTranslation('crd-chat');
  return (
    <div
      data-testid="chat-call-entry"
      data-kind={kind}
      className="flex items-center gap-1.5 self-center rounded-full bg-muted px-2.5 py-0.5 text-caption text-muted-foreground"
    >
      <ChatCallIcon kind={kind} className="size-3.5" />
      <span>{t(`call.entry.${kind}`)}</span>
      <span aria-hidden="true">·</span>
      <span>{time}</span>
    </div>
  );
}
