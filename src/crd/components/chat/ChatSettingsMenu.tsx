import { Bell, Maximize2, Pencil, Settings } from 'lucide-react';
import { chatHeaderIconButtonClass, chatHeaderLargeIconClass } from '@/crd/components/chat/CallControls';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

/** The header toggle the panel hands to the menu when its header has no room for the icon. */
export type ChatSettingsMenuToggles = {
  expand?: { label: string; onSelect: () => void };
};

type ChatSettingsMenuProps = ChatSettingsMenuToggles & {
  /** Accessible name of the gear. */
  label: string;
  showOnlineLabel: string;
  /** While off, others never see you online and there is no status to set. */
  showOnline: boolean;
  onShowOnlineChange: (showOnline: boolean) => void;
  statusLabel: string;
  onEditStatus: () => void;
  notificationSettingsLabel: string;
  onOpenNotificationSettings: () => void;
};

/** The gear in the chat header: the panel's expand toggle when given, whether you show as online, your status, and the notification settings. */
export function ChatSettingsMenu({
  expand,
  label,
  showOnlineLabel,
  showOnline,
  onShowOnlineChange,
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
        {expand && (
          <>
            <DropdownMenuItem onSelect={expand.onSelect}>
              <Maximize2 aria-hidden="true" />
              {expand.label}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuCheckboxItem checked={showOnline} onCheckedChange={onShowOnlineChange}>
          {showOnlineLabel}
        </DropdownMenuCheckboxItem>
        {showOnline && (
          <DropdownMenuItem onSelect={onEditStatus}>
            <Pencil aria-hidden="true" />
            {statusLabel}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onOpenNotificationSettings}>
          <Bell aria-hidden="true" />
          {notificationSettingsLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
