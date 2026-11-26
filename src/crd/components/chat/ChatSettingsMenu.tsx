import { Bell, Maximize2, Pencil, Settings, Volume2, VolumeX } from 'lucide-react';
import { chatHeaderIconButtonClass, chatHeaderLargeIconClass } from '@/crd/components/chat/CallControls';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

/** Header toggles the panel hands to the menu when its header has no room for their icons. */
export type ChatSettingsMenuToggles = {
  expand?: { label: string; onSelect: () => void };
  /** `label` names what a press does; `muted` is the current state. */
  sound?: { label: string; muted: boolean; onSelect: () => void };
};

type ChatSettingsMenuProps = ChatSettingsMenuToggles & {
  /** Accessible name of the gear. */
  label: string;
  statusLabel: string;
  onEditStatus: () => void;
  notificationSettingsLabel: string;
  onOpenNotificationSettings: () => void;
};

/** The gear in the chat header: the panel's expand and sound toggles when given, your status, and the notification settings. */
export function ChatSettingsMenu({
  expand,
  sound,
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
        {expand && (
          <DropdownMenuItem onSelect={expand.onSelect}>
            <Maximize2 aria-hidden="true" />
            {expand.label}
          </DropdownMenuItem>
        )}
        {sound && (
          <DropdownMenuItem onSelect={sound.onSelect}>
            {sound.muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            {sound.label}
          </DropdownMenuItem>
        )}
        {(expand || sound) && <DropdownMenuSeparator />}
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
