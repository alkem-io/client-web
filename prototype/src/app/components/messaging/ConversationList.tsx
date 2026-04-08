import { useState, useMemo } from "react";
import {
  Search,
  X,
  Hash,
  Users as UsersIcon,
  BellOff,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Conversation, ConversationType } from "./messagingData";

type FilterType = "all" | "dm" | "group" | "space";

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  /** Variant B/C: Space channels navigate to the Space page instead of opening inline */
  spaceChannelNavigates?: boolean;
  /** Custom label for the navigate hint */
  spaceNavigateLabel?: string;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "dm", label: "Direct" },
  { value: "group", label: "Groups" },
  { value: "space", label: "Spaces" },
];

function getUnreadByType(
  conversations: Conversation[],
  type: ConversationType
): number {
  return conversations
    .filter((c) => c.type === type)
    .reduce((sum, c) => sum + c.unread, 0);
}

export function ConversationList({
  conversations,
  onSelect,
  searchQuery,
  onSearchChange,
  spaceChannelNavigates = false,
  spaceNavigateLabel,
}: ConversationListProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadDm = getUnreadByType(conversations, "dm");
  const unreadGroup = getUnreadByType(conversations, "group");
  const unreadSpace = getUnreadByType(conversations, "space");

  const filtered = useMemo(() => {
    let list = conversations;
    if (filter !== "all") {
      list = list.filter((c) => c.type === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, filter, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Filter pills ──────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1.5 shrink-0"
        style={{ padding: "0 16px 10px" }}
      >
        {FILTER_OPTIONS.map((opt) => {
          const isActive = filter === opt.value;
          const unread =
            opt.value === "dm"
              ? unreadDm
              : opt.value === "group"
              ? unreadGroup
              : opt.value === "space"
              ? unreadSpace
              : 0;

          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className="flex items-center gap-1 rounded-full transition-all"
              style={{
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 500,
                fontFamily: "'Inter', sans-serif",
                background: isActive ? "var(--primary)" : "var(--secondary)",
                color: isActive
                  ? "var(--primary-foreground)"
                  : "var(--muted-foreground)",
                border: "none",
              }}
            >
              {opt.label}
              {unread > 0 && opt.value !== "all" && (
                <span
                  className="rounded-full flex items-center justify-center"
                  style={{
                    minWidth: 16,
                    height: 16,
                    padding: "0 4px",
                    fontSize: "10px",
                    fontWeight: 700,
                    background: isActive
                      ? "var(--primary-foreground)"
                      : "var(--primary)",
                    color: isActive
                      ? "var(--primary)"
                      : "var(--primary-foreground)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search ────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 16px 12px" }}>
        <div
          className="relative flex items-center"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <Search
            className="absolute"
            style={{
              left: 10,
              width: 14,
              height: 14,
              color: "var(--muted-foreground)",
            }}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent outline-none"
            style={{
              padding: "7px 30px 7px 32px",
              fontSize: "var(--text-sm)",
              color: "var(--foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute p-1 rounded-sm"
              style={{
                right: 6,
                color: "var(--muted-foreground)",
              }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>
      </div>

      {/* ── List ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ padding: "48px 24px" }}
          >
            <MessageSquare
              style={{
                width: 32,
                height: 32,
                color: "var(--muted-foreground)",
                opacity: 0.4,
                marginBottom: 12,
              }}
            />
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--muted-foreground)",
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.5,
                maxWidth: 240,
              }}
            >
              {searchQuery
                ? "No conversations match your search."
                : "No conversations yet. Start a message to connect with your team."}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              onClick={() => onSelect(conv)}
              navigatesOut={spaceChannelNavigates && conv.type === "space"}
              navigateLabel={spaceNavigateLabel}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Single conversation row ─────────────────────────────────────────────────

function ConversationItem({
  conversation,
  onClick,
  navigatesOut = false,
  navigateLabel,
}: {
  conversation: Conversation;
  onClick: () => void;
  /** When true, shows "Open in Space" hint — used for Variant B */
  navigatesOut?: boolean;
  /** Custom label for the navigate hint */
  navigateLabel?: string;
}) {
  const hasUnread = conversation.unread > 0;

  const TypeIcon = () => {
    if (conversation.type === "space")
      return (
        <Hash
          style={{
            width: 10,
            height: 10,
            color: "var(--muted-foreground)",
          }}
        />
      );
    if (conversation.type === "group")
      return (
        <UsersIcon
          style={{
            width: 10,
            height: 10,
            color: "var(--muted-foreground)",
          }}
        />
      );
    return null;
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 text-left transition-colors group/item"
      style={{
        padding: "10px 16px",
        background: hasUnread
          ? "color-mix(in srgb, var(--primary) 4%, transparent)"
          : "transparent",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = hasUnread
          ? "color-mix(in srgb, var(--primary) 7%, transparent)"
          : "var(--accent)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = hasUnread
          ? "color-mix(in srgb, var(--primary) 4%, transparent)"
          : "transparent")
      }
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {conversation.type === "dm" ? (
          <Avatar style={{ width: 40, height: 40, border: "1px solid var(--border)" }}>
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback
              style={{
                fontSize: "12px",
                fontWeight: 600,
                background: "var(--secondary)",
                color: "var(--secondary-foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {conversation.initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: "calc(var(--radius) + 2px)",
              background: conversation.avatarColor ?? "var(--secondary)",
              color: "var(--primary-foreground)",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {conversation.type === "space" ? (
              <Hash style={{ width: 18, height: 18 }} />
            ) : (
              conversation.initials
            )}
          </div>
        )}

        {/* Online indicator (DM only) */}
        {conversation.type === "dm" && conversation.isOnline && (
          <span
            className="absolute rounded-full"
            style={{
              width: 10,
              height: 10,
              background: "var(--success)",
              border: "2px solid var(--card)",
              bottom: 0,
              right: 0,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="truncate"
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: hasUnread ? 600 : 500,
                color: "var(--foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {conversation.name}
            </span>
            <TypeIcon />
            {conversation.muted && (
              <BellOff
                style={{
                  width: 10,
                  height: 10,
                  color: "var(--muted-foreground)",
                  opacity: 0.6,
                }}
              />
            )}
          </div>
          <span
            className="shrink-0"
            style={{
              fontSize: "11px",
              color: hasUnread
                ? "var(--primary)"
                : "var(--muted-foreground)",
              fontWeight: hasUnread ? 600 : 400,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {conversation.timeLabel}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2" style={{ marginTop: 2 }}>
          <p
            className="truncate"
            style={{
              fontSize: "12px",
              color: hasUnread
                ? "var(--foreground)"
                : "var(--muted-foreground)",
              fontWeight: hasUnread ? 500 : 400,
              margin: 0,
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.4,
            }}
          >
            {conversation.lastMessage}
          </p>
          {hasUnread && !navigatesOut && (
            <span
              className="shrink-0 rounded-full flex items-center justify-center"
              style={{
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                fontSize: "10px",
                fontWeight: 700,
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {conversation.unread}
            </span>
          )}
        </div>

        {/* Variant B: "Open in Space" hint for Space channels */}
        {navigatesOut && (
          <div
            className="flex items-center gap-1 mt-1"
            style={{
              fontSize: "10px",
              fontWeight: 500,
              color: "var(--primary)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <ArrowUpRight style={{ width: 10, height: 10 }} />
            <span>{navigateLabel ?? "Open in Space drawer"}</span>
            {hasUnread && (
              <span
                className="rounded-full flex items-center justify-center ml-auto"
                style={{
                  minWidth: 16,
                  height: 16,
                  padding: "0 4px",
                  fontSize: "9px",
                  fontWeight: 700,
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                {conversation.unread}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}