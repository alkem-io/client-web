import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  Search,
  MessageSquare,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  LayoutGrid,
  Home,
  Grid3X3,
  Clock,
  Check,
  UserPlus,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useSearch } from "@/app/contexts/SearchContext";
import { useGridOverlay } from "@/app/contexts/GridOverlayContext";
import { useNotifications } from "@/app/contexts/NotificationsContext";
import { useMessages } from "@/app/contexts/MessagesContext";
import { AppBreadcrumb } from "@/app/components/layout/AppBreadcrumb";

import AlkemioSymbolSquare from "@/imports/AlkemioSymbolSquare";

// Preview data for dropdown menus
const PREVIEW_NOTIFICATIONS = [
  { id: 1, author: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", action: "commented on", target: "Sustainability Goals 2024", time: "2m ago", read: false, type: "comment" },
  { id: 2, author: "Marc Johnson", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150", action: "invited you to", target: "Urban Mobility Lab", time: "1h ago", read: false, type: "invite" },
  { id: 3, author: "Alkemio Bot", avatar: "", action: "mentioned you in", target: "Platform Updates Q1", time: "5h ago", read: true, type: "mention" },
];

const PREVIEW_MESSAGES = [
  { id: "1", name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80", lastMessage: "That sounds great! Let me check the data...", time: "2m" },
  { id: "2", name: "David Kim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80", lastMessage: "The prototype is ready for review", time: "1h" },
  { id: "3", name: "Emily Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80", lastMessage: "Can we schedule a call tomorrow?", time: "3h" },
];

export function Header({
  className,
  onMenuClick,
}: {
  className?: string;
  onMenuClick?: () => void;
}) {
  const { openSearch } = useSearch();
  const { isVisible: isGridVisible, toggle: toggleGrid } = useGridOverlay();
  const { openNotifications } = useNotifications();
  const { openMessages } = useMessages();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(document.documentElement.classList.contains('dark'));
  };

  // Transparent header overlay on space/subspace pages (banner visible)
  const location = useLocation();
  const hasBanner = location.pathname.startsWith("/space") || location.pathname.startsWith("/innovation-hub");
  const [scrolledPastBanner, setScrolledPastBanner] = useState(false);

  useEffect(() => {
    if (!hasBanner) return;
    const onScroll = () => setScrolledPastBanner(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasBanner]);

  const headerTransparent = hasBanner && !scrolledPastBanner;

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openSearch]);

  // Frosted glass pill style for items over transparent header
  const frostedPill = headerTransparent
    ? {
        background: isDark ? "rgba(24,25,30,0.7)" : "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "8px",
        padding: "4px 12px",
      }
    : undefined;

  return (
    <header
      className={cn(
        "h-16 sticky top-0 z-50 px-6 md:px-8 transition-colors duration-300",
        headerTransparent
          ? "bg-transparent border-b border-transparent"
          : "bg-background border-b border-border",
        className
      )}
    >
      <div className="grid grid-cols-12 gap-6 h-full items-center">
        <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex items-center justify-between">
      {/* ─── Left: Logo + mobile menu ─── */}
      <div className="flex items-center gap-4" style={frostedPill}>
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 hover:bg-accent rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Alkemio logo — always visible as breadcrumb Home anchor */}
        <Link to="/" className="flex items-center shrink-0" aria-label="Home">
          <div className="w-8 h-8">
            <AlkemioSymbolSquare />
          </div>
        </Link>

        {/* Universal breadcrumb trail */}
        <AppBreadcrumb className="ml-1" />
      </div>

      {/* ─── Right: icon row ─── */}
      <div className="flex items-center gap-1" style={frostedPill}>
        {/* Search icon button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={() => openSearch()}
          title="Search (⌘K)"
        >
          <Search className="w-5 h-5" />
        </Button>

        {/* Messaging dropdown → full overlay on click */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-background"
                style={{ background: "var(--primary)" }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--border)", background: "color-mix(in srgb, var(--muted) 30%, transparent)" }}
            >
              <span className="text-card-title">Messages</span>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {PREVIEW_MESSAGES.map((c) => (
                <button
                  key={c.id}
                  onClick={openMessages}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <Avatar className="w-9 h-9 shrink-0" style={{ border: "1px solid var(--border)" }}>
                    <AvatarImage src={c.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-caption">{c.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-body-emphasis truncate">{c.name}</span>
                      <span className="text-caption text-muted-foreground shrink-0">{c.time}</span>
                    </div>
                    <p className="text-caption text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-2" style={{ borderTop: "1px solid var(--border)", background: "color-mix(in srgb, var(--muted) 30%, transparent)" }}>
              <Button variant="ghost" size="sm" className="w-full h-8 text-caption" onClick={openMessages}>
                Open all messages
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications dropdown → full overlay on click */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {PREVIEW_NOTIFICATIONS.filter(n => !n.read).length > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-background"
                  style={{ background: "var(--destructive)" }}
                />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 md:w-96 p-0 overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--border)", background: "color-mix(in srgb, var(--muted) 30%, transparent)" }}
            >
              <span className="text-card-title">Notifications</span>
              <span className="text-caption font-medium text-primary cursor-pointer hover:opacity-80">Mark all as read</span>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {PREVIEW_NOTIFICATIONS.map((n) => (
                <button
                  key={n.id}
                  onClick={openNotifications}
                  className={cn(
                    "flex gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors",
                    !n.read && "bg-primary/5 hover:bg-primary/10"
                  )}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div className="shrink-0 mt-0.5 relative">
                    <Avatar className="w-8 h-8 md:w-10 md:h-10" style={{ border: "1px solid var(--border)" }}>
                      <AvatarImage src={n.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-caption">{n.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute -bottom-1 -right-1 rounded-full p-0.5"
                      style={{ background: "var(--primary)", color: "var(--primary-foreground)", border: "2px solid var(--background)" }}
                    >
                      {n.type === "invite" && <UserPlus className="w-2.5 h-2.5" />}
                      {n.type === "comment" && <MessageSquare className="w-2.5 h-2.5" />}
                      {n.type === "mention" && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-body leading-snug">
                      <span className="font-semibold">{n.author}</span>{" "}
                      {n.action}{" "}
                      <span className="font-medium opacity-80">{n.target}</span>
                    </p>
                    <p className="flex items-center gap-1 text-caption text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {n.time}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="shrink-0 mt-1.5">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--primary)" }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="p-2" style={{ borderTop: "1px solid var(--border)", background: "color-mix(in srgb, var(--muted) 30%, transparent)" }}>
              <Button variant="ghost" size="sm" className="w-full h-8 text-caption" onClick={openNotifications}>
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spaces Grid icon */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          title="Spaces"
          asChild
        >
          <Link to="/spaces">
            <LayoutGrid className="w-5 h-5" />
          </Link>
        </Button>

        <div
          className="h-6 w-px hidden md:block"
          style={{ background: "var(--border)" }}
        />

        {/* Profile avatar + dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="outline-none">
            <div className="relative p-1.5 rounded-full hover:bg-accent/50 transition-colors cursor-pointer">
              <Avatar
                className="h-8 w-8"
                style={{ border: "1px solid var(--border)" }}
              >
                <AvatarImage
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User"
                />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              {/* Beta badge */}
              <Badge
                variant="secondary"
                className="absolute -bottom-1 -right-1 px-1 py-0 h-4 border border-border text-badge"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: "14px",
                }}
              >
                Beta
              </Badge>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel
              className="text-label uppercase text-muted-foreground"
            >
              My Account
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/" className="cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                <span>My Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/user/alex-rivera" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/user/alex-rivera/settings/account"
                className="cursor-pointer"
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>My Account</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/user/alex-rivera/settings/general"
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={toggleDarkMode}
              className="cursor-pointer"
            >
              {isDark ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={toggleGrid}
              className="cursor-pointer"
            >
              <Grid3X3 className="mr-2 h-4 w-4" />
              <span>{isGridVisible ? "Hide Grid" : "Show Grid"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
        </div>
      </div>
    </header>
  );
}
