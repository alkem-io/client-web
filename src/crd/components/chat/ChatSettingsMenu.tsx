import { Bell, Pencil, Settings } from 'lucide-react';
import { chatHeaderIconButtonClass, chatHeaderLargeIconClass } from '@/crd/components/chat/CallControls';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

type ChatSettingsMenuProps = {
  /** Accessible name of the gear. */
  label: string;
  statusLabel: string;
  onEditStatus: () => void;
  notificationSettingsLabel: string;
  onOpenNotificationSettings: () => void;
};

/** The gear in the conversation list header: your status, and the notification settings. */
export function ChatSettingsMenu({
  label,
  statusLabel,
  onEditStatus,
  notificationSettingsLabel,
  onOpenNotificationSettings,
}: ChatSettingsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <button type="button" aria-label={label} className={chatHeaderIconButtonClass}>
          <Settings aria-hidden="true" className={chatHeaderLargeIconClass} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[60] min-w-44">
        <DropdownMenuItem onSelect={onEditStatus}>
          <Pencil aria-hidden="true" />
          {statusLabel}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onOpenNotificationSettings}>
          <Bell aria-hidden="true" />
          {notificationSettingsLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
