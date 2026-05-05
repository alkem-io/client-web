import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  Search,
  MessageSquare,
  Bell,
  Check,
  UserPlus,
  Clock,
  Menu,
  User,
  Settings,
  LogOut,
  LayoutGrid,
  Home,
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

import AlkemioSymbolSquare from "@/imports/AlkemioSymbolSquare";

// Mock notifications
const notifications = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    action: "commented on",
    target: "Sustainability Goals 2024",
    time: "2m ago",
    read: false,
    type: "comment",
  },
  {
    id: 2,
    author: "Marc Johnson",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150",
    action: "invited you to",
    target: "Urban Mobility Lab",
    time: "1h ago",
    read: false,
    type: "invite",
  },
  {
    id: 3,
    author: "Alkemio Bot",
    avatar: "",
    action: "mentioned you in",
    target: "Platform Updates Q1",
    time: "5h ago",
    read: true,
    type: "mention",
  },
];

export function Header({
  className,
  onMenuClick,
}: {
  className?: string;
  onMenuClick?: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const { openSearch } = useSearch();
  const location = useLocation();
  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard";

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

  return (
    <header
      className={cn(
        "h-16 border-b border-border bg-background sticky top-0 z-50 px-6 flex items-center justify-between",
        className
      )}
    >
      {/* ─── Left: Logo + mobile menu ─── */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 hover:bg-accent rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Alkemio logo — hidden on dashboard (sidebar has it), visible on other pages as home link */}
        {!isDashboard && (
          <Link to="/" className="flex items-center shrink-0" aria-label="Home">
            <div className="w-8 h-8">
              <AlkemioSymbolSquare />
            </div>
          </Link>
        )}
      </div>

      {/* ─── Right: icon row ─── */}
      <div className="flex items-center gap-1">
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

        {/* Messaging icon — always visible */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          title="Messages"
          asChild
        >
          <Link to="/messages">
            <MessageSquare className="w-5 h-5" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-background"
              style={{ background: "var(--primary)" }}
            />
          </Link>
        </Button>

        {/* Notifications bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 md:w-96 p-0 overflow-hidden"
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--muted) 30%, transparent)",
              }}
            >
              <h3
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  color: "var(--foreground)",
                }}
              >
                Notifications
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 text-primary hover:text-primary/80"
                style={{ fontSize: "12px" }}
              >
                Mark all as read
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.read && "bg-primary/5 hover:bg-primary/10"
                  )}
                  style={{
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5 relative">
                    <Avatar
                      className="w-8 h-8 md:w-10 md:h-10"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <AvatarImage src={notification.avatar} />
                      <AvatarFallback
                        className="bg-primary/10 text-primary"
                        style={{ fontSize: "12px" }}
                      >
                        {notification.author.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Type badge */}
                    <div
                      className="absolute -bottom-1 -right-1 rounded-full p-0.5"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        border: "2px solid var(--background)",
                      }}
                    >
                      {notification.type === "invite" && (
                        <UserPlus className="w-2.5 h-2.5" />
                      )}
                      {notification.type === "comment" && (
                        <MessageSquare className="w-2.5 h-2.5" />
                      )}
                      {notification.type === "mention" && (
                        <Check className="w-2.5 h-2.5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p
                      className="leading-snug"
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--foreground)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>
                        {notification.author}
                      </span>{" "}
                      {notification.action}{" "}
                      <span
                        style={{
                          fontWeight: 500,
                          color: "var(--foreground)",
                          opacity: 0.8,
                        }}
                      >
                        {notification.target}
                      </span>
                    </p>
                    <p
                      className="flex items-center gap-1"
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 mt-1.5">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: "var(--primary)" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              className="p-2 text-center"
              style={{
                borderTop: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--muted) 30%, transparent)",
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8"
                style={{ fontSize: "12px" }}
                asChild
              >
                <Link to="/notifications">View all notifications</Link>
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
        <DropdownMenu>
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
                className="absolute -bottom-1 -right-1 px-1 py-0 h-4 border border-border"
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
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
              className="uppercase tracking-wider text-muted-foreground"
              style={{ fontSize: "11px" }}
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
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
