import { useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  MessageSquare,
  UserPlus,
  Check,
  CheckCheck,
  Clock,
  Filter,
  Settings,
  Trash2,
  MailOpen,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
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

export default function NotificationsPage() {
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
    <div
      className="w-full px-6 md:px-8"
      style={{
        paddingTop: 32,
        paddingBottom: 64,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-start-2 lg:col-span-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--foreground)",
            }}
          >
            Notifications
          </h1>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
              marginTop: 4,
            }}
          >
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark all read
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/user/alex-rivera/settings/notifications">
              <Settings className="w-4 h-4 mr-1.5" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="flex items-center gap-2 mb-6 pb-4 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {(
          [
            { key: "all", label: "All" },
            { key: "comment", label: "Comments" },
            { key: "invite", label: "Invitations" },
            { key: "mention", label: "Mentions" },
            { key: "system", label: "System" },
          ] as { key: NotificationType | "all"; label: string }[]
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-md transition-colors whitespace-nowrap",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            )}
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)" as any,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {f.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors",
              showUnreadOnly
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            )}
            style={{
              fontSize: "var(--text-sm)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <MailOpen className="w-3.5 h-3.5" />
            Unread only
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex flex-col">
        {filtered.length > 0 ? (
          filtered.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex gap-4 p-4 transition-colors cursor-pointer group",
                !n.read && "bg-primary/5"
              )}
              style={{
                borderBottom: "1px solid var(--border)",
              }}
              onClick={() => toggleRead(n.id)}
            >
              {/* Avatar + type badge */}
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10" style={{ border: "1px solid var(--border)" }}>
                  <AvatarImage src={n.avatar} />
                  <AvatarFallback
                    className="bg-primary/10 text-primary"
                    style={{ fontSize: "var(--text-sm)" }}
                  >
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

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className="leading-snug"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--foreground)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{n.author}</span>{" "}
                  {n.action}{" "}
                  <span style={{ fontWeight: 500, color: "var(--foreground)" }}>
                    {n.target}
                  </span>
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span
                    className="flex items-center gap-1"
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    {n.time}
                  </span>
                  {n.space && (
                    <Badge
                      variant="secondary"
                      style={{
                        fontSize: "11px",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {n.space}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div className="shrink-0 mt-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full animate-pulse"
                    style={{ background: "var(--primary)" }}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "var(--muted)" }}
            >
              <Bell
                className="w-7 h-7"
                style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
              />
            </div>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--muted-foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {showUnreadOnly
                ? "No unread notifications"
                : "No notifications match your filter"}
            </p>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
