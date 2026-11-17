import { WifiOff } from 'lucide-react';

type ChatConnectionNoticeProps = {
  message: string;
};

/** A slim status strip telling the user the chat is reconnecting and new messages may be delayed. */
export function ChatConnectionNotice({ message }: ChatConnectionNoticeProps) {
  return (
    <output className="flex shrink-0 items-center gap-2 border-b border-border bg-muted px-3 py-2 text-caption text-muted-foreground">
      <WifiOff aria-hidden="true" className="size-4 shrink-0" />
      <span className="min-w-0">{message}</span>
    </output>
  );
}
