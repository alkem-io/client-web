import { useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  MessageSquare,
  UserPlus,
  Check,
  CheckCheck,
  Clock,
  Settings,
  MailOpen,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { cn } from "@/lib/utils";

type NotificationType = "comment" | "invite" | "mention" | "system";

interface Notification {
  id: string;
  author: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  read: boolean;
  type: NotificationType;
  space?: string;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    author: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    action: "commented on your post in",
    target: "Sustainability Goals 2024",
    time: "2 minutes ago",
    read: false,
    type: "comment",
    space: "Green Energy Space",
  },
  {
    id: "2",
    author: "Marc Johnson",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    action: "invited you to join",
    target: "Urban Mobility Lab",
    time: "1 hour ago",
    read: false,
    type: "invite",
  },
  {
    id: "3",
    author: "Emily Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    action: "mentioned you in",
    target: "Energy Transition Strategy",
    time: "3 hours ago",
    read: false,
    type: "mention",
    space: "Sustainable Futures",
  },
  {
    id: "4",
    author: "Alkemio",
    avatar: "",
    action: "Platform update:",
    target: "New template library features are live",
    time: "5 hours ago",
    read: true,
    type: "system",
  },
  {
    id: "6",
    author: "Anna Martinez",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    action: "invited you to join",
    target: "Design Thinking Practice",
    time: "Yesterday",
    read: true,
    type: "invite",
  },
  {
    id: "7",
    author: "Tom Bakker",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    action: "commented on",
    target: "Water Infrastructure Plan",
    time: "2 days ago",
    read: true,
    type: "comment",
    space: "Urban Development Network",
  },
  {
    id: "8",
    author: "Nina van Dijk",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    action: "mentioned you in",
    target: "Digital Health Tools Review",
    time: "3 days ago",
    read: true,
    type: "mention",
    space: "Health Innovation Alliance",
  },
];

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  comment: <MessageSquare className="w-3 h-3" />,
  invite: <UserPlus className="w-3 h-3" />,
  mention: <Check className="w-3 h-3" />,
  system: <Bell className="w-3 h-3" />,
};

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (showUnreadOnly && n.read) return false;
    if (filter !== "all" && n.type !== filter) return false;
    return true;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-background"
              style={{ background: "var(--destructive)" }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[420px] p-0 overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
        sideOffset={8}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderBottom: "1px solid var(--border)",
            background: "color-mix(in srgb, var(--muted) 30%, transparent)",
          }}
        >
          <h3 className="text-sm font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <Link to="/user/alex-rivera/settings/notifications">
                <Settings className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {(
            [
              { key: "all", label: "All" },
              { key: "comment", label: "Comments" },
              { key: "invite", label: "Invites" },
              { key: "mention", label: "Mentions" },
              { key: "system", label: "System" },
            ] as { key: NotificationType | "all"; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium",
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              )}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={cn(
              "ml-auto flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors text-xs shrink-0",
              showUnreadOnly
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            )}
          >
            <MailOpen className="w-3 h-3" />
            Unread
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-muted/50",
                  !n.read && "bg-primary/5 hover:bg-primary/10"
                )}
                style={{ borderBottom: "1px solid var(--border)" }}
                onClick={() => toggleRead(n.id)}
              >
                <div className="relative shrink-0">
                  <Avatar className="w-9 h-9" style={{ border: "1px solid var(--border)" }}>
                    <AvatarImage src={n.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {n.author.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="absolute -bottom-1 -right-1 rounded-full p-0.5"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      border: "2px solid var(--background)",
                    }}
                  >
                    {TYPE_ICON[n.type]}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-semibold">{n.author}</span>{" "}
                    {n.action}{" "}
                    <span className="font-medium">{n.target}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {n.time}
                    </span>
                    {n.space && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {n.space}
                      </Badge>
                    )}
                  </div>
                </div>

                {!n.read && (
                  <div className="shrink-0 mt-2">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: "var(--primary)" }}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: "var(--muted)" }}
              >
                <Bell className="w-5 h-5" style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
              </div>
              <p className="text-sm text-muted-foreground">
                {showUnreadOnly
                  ? "No unread notifications"
                  : "No notifications match your filter"}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
