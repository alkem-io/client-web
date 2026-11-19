import { Loader2, WifiOff } from 'lucide-react';

type ChatConnectionNoticeProps = {
  message: string;
  /** Something is under way (a spinner) rather than the connection being lost. */
  busy?: boolean;
};

/** A slim status strip under the chat header, e.g. the chat is reconnecting or a call is being prepared. */
export function ChatConnectionNotice({ message, busy = false }: ChatConnectionNoticeProps) {
  const Icon = busy ? Loader2 : WifiOff;
  return (
    <output className="flex shrink-0 items-center gap-2 border-b border-border bg-muted px-3 py-2 text-caption text-muted-foreground">
      <Icon aria-hidden="true" className={busy ? 'size-4 shrink-0 animate-spin' : 'size-4 shrink-0'} />
      <span className="min-w-0">{message}</span>
    </output>
  );
}
