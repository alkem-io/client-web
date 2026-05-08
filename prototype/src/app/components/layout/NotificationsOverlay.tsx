import { useState, useEffect } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  MessageSquare,
  UserPlus,
  Check,
  CheckCheck,
  Clock,
  Settings,
  MailOpen,
  X,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/app/contexts/NotificationsContext";

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

export function NotificationsOverlay() {
  const { isOpen, closeNotifications } = useNotifications();
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

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeNotifications();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closeNotifications]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{ background: "color-mix(in srgb, var(--foreground) 50%, transparent)", backdropFilter: "blur(2px)" }}
            onClick={closeNotifications}
            aria-hidden
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
            className="fixed inset-0 z-[101] grid grid-cols-12 gap-6 px-6 md:px-8 py-[5vh] max-md:p-0 pointer-events-none"
          >
            <div
            className={cn(
              "col-start-4 col-span-6 max-lg:col-start-3 max-lg:col-span-8 max-md:col-start-1 max-md:col-span-12",
              "flex flex-col overflow-hidden pointer-events-auto",
            )}
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--elevation-sm)",
            }}
          >
            {/* Header */}
            <div
              className="shrink-0 flex items-center justify-between px-5 py-4 md:px-6"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "var(--secondary)" }}
                >
                  <Bell className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                      : "You're all caught up"}
                  </p>
                </div>
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
                  <Link to="/user/alex-rivera/settings/notifications" onClick={closeNotifications}>
                    <Settings className="w-4 h-4 mr-1.5" />
                    Settings
                  </Link>
                </Button>
                <button
                  onClick={closeNotifications}
                  className="p-1.5 rounded-full transition-colors hover:bg-accent ml-2"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div
              className="shrink-0 flex items-center gap-2 px-5 md:px-6 py-3 overflow-x-auto"
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
                    "px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-sm font-medium",
                    filter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  )}
                >
                  {f.label}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm",
                    showUnreadOnly
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-accent"
                  )}
                >
                  <MailOpen className="w-3.5 h-3.5" />
                  Unread only
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length > 0 ? (
                filtered.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-4 px-5 md:px-6 py-4 transition-colors cursor-pointer hover:bg-muted/50",
                      !n.read && "bg-primary/5 hover:bg-primary/10"
                    )}
                    style={{ borderBottom: "1px solid var(--border)" }}
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
                      <p className="text-sm leading-snug">
                        <span className="font-semibold">{n.author}</span>{" "}
                        {n.action}{" "}
                        <span className="font-medium">{n.target}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {n.time}
                        </span>
                        {n.space && (
                          <Badge variant="secondary" className="text-[11px]">
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
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "var(--muted)" }}
                  >
                    <Bell className="w-7 h-7" style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {showUnreadOnly
                      ? "No unread notifications"
                      : "No notifications match your filter"}
                  </p>
                </div>
              )}
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
