import { Loader2, PhoneOff, WifiOff } from 'lucide-react';

type ChatConnectionNoticeProps = {
  message: string;
  /** What the strip reports: the connection is lost (default), something is under way, or something failed. */
  kind?: 'offline' | 'busy' | 'failed';
};

const ICONS = { offline: WifiOff, busy: Loader2, failed: PhoneOff };

/** A slim status strip under the chat header, e.g. the chat is reconnecting or a call is being prepared. */
export function ChatConnectionNotice({ message, kind = 'offline' }: ChatConnectionNoticeProps) {
  const Icon = ICONS[kind];
  return (
    <output className="flex shrink-0 items-center gap-2 border-b border-border bg-muted px-3 py-2 text-caption text-muted-foreground">
      <Icon aria-hidden="true" className={kind === 'busy' ? 'size-4 shrink-0 animate-spin' : 'size-4 shrink-0'} />
      <span className="min-w-0">{message}</span>
    </output>
  );
}
