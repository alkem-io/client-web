import { useMemo } from "react";
import {
  Hash,
  Users as UsersIcon,
  MessageSquare,
  Plus,
  BellOff,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { useMessagingHub } from "@/app/contexts/MessagingHubContext";
import { CONVERSATIONS, type Conversation } from "./messagingData";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";

/**
 * ChatRail — A collapsed vertical bar on the right side showing conversation icons.
 * Mirrors the left sidebar's collapsed state. Variant A only.
 * When the MessagingHub is open, the rail hides.
 */
export function ChatRail() {
  const { isHubOpen, openHub } = useMessagingHub();

  // Sort: unread first, then by most recent
  const sortedConversations = useMemo(() => {
    return [...CONVERSATIONS].sort((a, b) => {
      if (a.unread > 0 && b.unread === 0) return -1;
      if (a.unread === 0 && b.unread > 0) return 1;
      return 0;
    });
  }, []);

  const totalUnread = CONVERSATIONS.reduce((s, c) => s + c.unread, 0);

  // Don't render when the Hub is open
  if (isHubOpen) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-30"
        style={{
          width: 64,
          background: "var(--sidebar)",
          borderLeft: "1px solid var(--sidebar-border)",
        }}
      >
        {/* Header area — aligns with main header height */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            height: 64,
            borderBottom: "1px solid var(--sidebar-border)",
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => openHub()}
                className="relative flex items-center justify-center rounded-full transition-colors"
                style={{
                  width: 38,
                  height: 38,
                  background: "var(--sidebar-accent)",
                  color: "var(--sidebar-foreground)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--sidebar-primary)";
                  e.currentTarget.style.color = "var(--sidebar-primary-foreground)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--sidebar-accent)";
                  e.currentTarget.style.color = "var(--sidebar-foreground)";
                }}
              >
                <MessageSquare style={{ width: 18, height: 18 }} />
                {totalUnread > 0 && (
                  <span
                    className="absolute flex items-center justify-center rounded-full"
                    style={{
                      top: -2,
                      right: -4,
                      minWidth: 18,
                      height: 18,
                      padding: "0 4px",
                      fontSize: "10px",
                      fontWeight: 700,
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      border: "2px solid var(--sidebar)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={8}>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                All Messages
              </span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Conversation icons */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col items-center gap-1"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {sortedConversations.map((conv) => (
            <ChatRailItem
              key={conv.id}
              conversation={conv}
              onClick={() => openHub(conv.id)}
            />
          ))}

          {/* Divider */}
          <div
            style={{
              width: 28,
              height: 1,
              background: "var(--sidebar-border)",
              margin: "6px 0",
              flexShrink: 0,
            }}
          />

          {/* New conversation button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => openHub()}
                className="flex items-center justify-center rounded-md transition-colors shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  color: "var(--sidebar-foreground)",
                  opacity: 0.5,
                  border: "1px dashed var(--sidebar-border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--sidebar-accent)";
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.opacity = "0.5";
                }}
              >
                <Plus style={{ width: 16, height: 16 }} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={8}>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                New Message
              </span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Bottom padding */}
        <div style={{ height: 8, shrinkFlex: 0 }} />
      </aside>
    </TooltipProvider>
  );
}

// ─── Single conversation icon ────────────────────────────────────────────────

function ChatRailItem({
  conversation,
  onClick,
}: {
  conversation: Conversation;
  onClick: () => void;
}) {
  const hasUnread = conversation.unread > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="relative flex items-center justify-center rounded-md transition-all shrink-0"
          style={{
            width: 40,
            height: 40,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--sidebar-accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {/* Avatar / icon */}
          {conversation.type === "dm" ? (
            <Avatar
              style={{
                width: 32,
                height: 32,
                border: "1px solid var(--border)",
              }}
            >
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback
                style={{
                  fontSize: "10px",
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
                width: 32,
                height: 32,
                borderRadius: "calc(var(--radius))",
                background: conversation.avatarColor ?? "var(--secondary)",
                color: "var(--primary-foreground)",
                fontSize: "10px",
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {conversation.type === "space" ? (
                <Hash style={{ width: 15, height: 15 }} />
              ) : (
                <UsersIcon style={{ width: 15, height: 15 }} />
              )}
            </div>
          )}

          {/* Online indicator (DM only) */}
          {conversation.type === "dm" && conversation.isOnline && (
            <span
              className="absolute rounded-full"
              style={{
                width: 8,
                height: 8,
                background: "var(--success)",
                border: "2px solid var(--sidebar)",
                bottom: 4,
                right: 4,
              }}
            />
          )}

          {/* Unread badge */}
          {hasUnread && (
            <span
              className="absolute flex items-center justify-center rounded-full"
              style={{
                top: 0,
                right: 0,
                minWidth: 16,
                height: 16,
                padding: "0 3px",
                fontSize: "9px",
                fontWeight: 700,
                background: "var(--success)",
                color: "var(--primary-foreground)",
                border: "2px solid var(--sidebar)",
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1,
              }}
            >
              {conversation.unread}
            </span>
          )}

          {/* Muted indicator */}
          {conversation.muted && !hasUnread && (
            <span
              className="absolute"
              style={{
                bottom: 2,
                right: 2,
              }}
            >
              <BellOff
                style={{
                  width: 8,
                  height: 8,
                  color: "var(--muted-foreground)",
                  opacity: 0.5,
                }}
              />
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={8} align="center">
        <div className="flex flex-col gap-0.5">
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: hasUnread ? 600 : "var(--font-weight-normal)" as any,
              color: "var(--popover-foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {conversation.name}
          </span>
          <span
            className="truncate"
            style={{
              fontSize: "11px",
              color: "var(--muted-foreground)",
              fontFamily: "'Inter', sans-serif",
              maxWidth: 200,
            }}
          >
            {conversation.lastMessage}
          </span>
          {hasUnread && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--primary)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {conversation.unread} unread
            </span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}