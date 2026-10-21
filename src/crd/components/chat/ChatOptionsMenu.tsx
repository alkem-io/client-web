import { EllipsisVertical, LogOut, Settings2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

type ChatOptionsMenuProps = {
  /** Tooltip and accessible name of the trigger. */
  label: string;
  settingsLabel: string;
  onOpenSettings: () => void;
  leaveLabel: string;
  /** Called when "leave" is chosen; the consumer confirms before leaving. */
  onLeave: () => void;
};

/**
 * The "more" menu in a conversation's header: the one place a chat's own
 * options live (settings, leave), so further options can join it without
 * another header icon.
 */
export function ChatOptionsMenu({ label, settingsLabel, onOpenSettings, leaveLabel, onLeave }: ChatOptionsMenuProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild={true}>
          <DropdownMenuTrigger asChild={true}>
            <button
              type="button"
              aria-label={label}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
            >
              <EllipsisVertical aria-hidden="true" className="size-5" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="z-[60] min-w-44">
        <DropdownMenuItem onSelect={onOpenSettings}>
          <Settings2 aria-hidden="true" />
          {settingsLabel}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onLeave}>
          <LogOut aria-hidden="true" />
          {leaveLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
