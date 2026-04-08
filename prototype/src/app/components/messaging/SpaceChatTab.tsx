import { useState, useRef, useEffect, useCallback } from "react";
import {
  Hash,
  Search,
  X,
  Users,
  Settings,
  MoreVertical,
  BellOff,
  MessageCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MessageComposer } from "./MessageComposer";
import type { Conversation, Message } from "./messagingData";
import { CONVERSATIONS, MESSAGES, USERS } from "./messagingData";

interface SpaceChatTabProps {
  spaceSlug: string;
}

export function SpaceChatTab({ spaceSlug }: SpaceChatTabProps) {
  const channel: Conversation | undefined = CONVERSATIONS.find(
    (c) => c.type === "space" && c.spaceSlug === spaceSlug
  );

  const fallbackChannel: Conversation = channel ?? {
    id: `space-${spaceSlug}`,
    type: "space",
    name: spaceSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    avatar: "",
    initials: spaceSlug.substring(0, 2).toUpperCase(),
    avatarColor: "var(--primary)",
    lastMessage: "",
    timeLabel: "",
    unread: 0,
    muted: false,
    memberCount: 0,
    spaceSlug,
  };

  const messages = MESSAGES[fallbackChannel.id] ?? [];
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [replyTo, setReplyTo] = useState<{ senderName: string; content: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMessages(MESSAGES[fallbackChannel.id] ?? []);
  }, [fallbackChannel.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  const handleSend = useCallback(
    (text: string) => {
      const newMsg: Message = {
        id: `new-${Date.now()}`,
        senderId: "me",
        senderName: "Alex Contributor",
        senderAvatar: USERS.me.avatar,
        senderInitials: "AC",
        content: text,
        timestamp: new Date().toISOString(),
        timeLabel: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        dateLabel: "Today",
        isOwn: true,
        replyTo: replyTo ?? undefined,
      };
      setLocalMessages((prev) => [...prev, newMsg]);
      setReplyTo(null);
    },
    [replyTo]
  );

  // Date separators
  const shouldShowDate = (msg: Message, idx: number) => {
    if (idx === 0) return true;
    return localMessages[idx - 1].dateLabel !== msg.dateLabel;
  };

  // Sender grouping
  const shouldShowSender = (msg: Message, idx: number) => {
    if (msg.isOwn) return false;
    if (idx === 0) return true;
    const prev = localMessages[idx - 1];
    return prev.senderId !== msg.senderId || prev.dateLabel !== msg.dateLabel;
  };

  // Search filtering
  const filteredMessages = searchQuery.trim()
    ? localMessages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : localMessages;

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: "var(--background)",
        minHeight: 0,
      }}
    >
      {/* ── Channel Header ───────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: "calc(var(--radius) + 2px)",
              background: fallbackChannel.avatarColor ?? "var(--secondary)",
              color: "var(--primary-foreground)",
            }}
          >
            <Hash style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                {fallbackChannel.name}
              </span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--muted-foreground)",
                  fontWeight: 400,
                }}
              >
                — Channel
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                color: "var(--muted-foreground)",
              }}
            >
              {fallbackChannel.memberCount ?? 0} members
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Search toggle */}
          <button
            onClick={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchQuery("");
            }}
            className="p-2 rounded-md transition-colors"
            style={{ color: isSearching ? "var(--primary)" : "var(--muted-foreground)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            title="Search in channel"
          >
            <Search style={{ width: 16, height: 16 }} />
          </button>

          {/* View Members */}
          <button
            className="p-2 rounded-md transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            title="View members"
          >
            <Users style={{ width: 16, height: 16 }} />
          </button>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-md transition-colors"
                style={{ color: "var(--muted-foreground)" }}
              >
                <MoreVertical style={{ width: 16, height: 16 }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ minWidth: 180 }}>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <BellOff style={{ width: 14, height: 14 }} />
                <span style={{ fontSize: "var(--text-sm)" }}>Mute Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Settings style={{ width: 14, height: 14 }} />
                <span style={{ fontSize: "var(--text-sm)" }}>Channel Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Inline Search Bar ────────────────────────────────────────── */}
      {isSearching && (
        <div
          className="flex items-center gap-2 shrink-0"
          style={{
            padding: "8px 20px",
            borderBottom: "1px solid var(--border)",
            background: "color-mix(in srgb, var(--primary) 3%, var(--background))",
          }}
        >
          <Search
            style={{
              width: 14,
              height: 14,
              color: "var(--muted-foreground)",
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent outline-none"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--foreground)",
            }}
          />
          {searchQuery && (
            <span
              style={{
                fontSize: "11px",
                color: "var(--muted-foreground)",
                whiteSpace: "nowrap",
              }}
            >
              {filteredMessages.length} result{filteredMessages.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => {
              setIsSearching(false);
              setSearchQuery("");
            }}
            className="p-1 rounded-sm transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      {/* ── Message Thread ────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ padding: "24px 24px 16px" }}
      >
        {filteredMessages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full text-center"
            style={{ padding: "60px 24px" }}
          >
            {searchQuery ? (
              <>
                <Search
                  style={{
                    width: 36,
                    height: 36,
                    color: "var(--muted-foreground)",
                    opacity: 0.3,
                    marginBottom: 16,
                  }}
                />
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.6,
                    maxWidth: 320,
                  }}
                >
                  No messages match "{searchQuery}".
                </p>
              </>
            ) : (
              <>
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 56,
                    height: 56,
                    background: "color-mix(in srgb, var(--primary) 8%, transparent)",
                    marginBottom: 16,
                  }}
                >
                  <MessageCircle
                    style={{
                      width: 28,
                      height: 28,
                      color: "var(--primary)",
                      opacity: 0.6,
                    }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: "var(--text-base)",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: 8,
                  }}
                >
                  This is the {fallbackChannel.name} channel
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.6,
                    maxWidth: 360,
                    marginBottom: 20,
                  }}
                >
                  Say hello to your team! Messages here are visible to all{" "}
                  {fallbackChannel.memberCount ?? 0} members of this Space.
                </p>
                <div className="flex items-center gap-2">
                  {["Say hello", "Share an update"].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        /* could pre-fill composer */
                      }}
                      className="rounded-full transition-colors"
                      style={{
                        padding: "6px 16px",
                        fontSize: "var(--text-sm)",
                        fontWeight: 500,
                        background: "var(--secondary)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--accent)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "var(--secondary)")
                      }
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1 w-full">
            {filteredMessages.map((msg, idx) => {
              const showDate = shouldShowDate(msg, idx);
              const showSender = shouldShowSender(msg, idx);

              return (
                <div key={msg.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div
                      className="flex items-center justify-center"
                      style={{ padding: "20px 0 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "var(--muted-foreground)",
                          background: "var(--secondary)",
                          padding: "4px 14px",
                          borderRadius: "999px",
                        }}
                      >
                        {msg.dateLabel}
                      </span>
                    </div>
                  )}

                  {/* Message */}
                  <div
                    className={cn(
                      "flex gap-3 group/msg",
                      msg.isOwn ? "justify-end" : "justify-start"
                    )}
                    style={{
                      padding: showSender ? "10px 0 3px" : "3px 0",
                      maxWidth: "80%",
                      marginLeft: msg.isOwn ? "auto" : undefined,
                    }}
                  >
                    {/* Avatar (non-own, first in group) */}
                    {!msg.isOwn && (
                      <div style={{ width: 32, flexShrink: 0 }}>
                        {showSender && (
                          <Avatar
                            style={{
                              width: 32,
                              height: 32,
                              border: "1px solid var(--border)",
                            }}
                          >
                            <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                            <AvatarFallback
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                              }}
                            >
                              {msg.senderInitials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    )}

                    <div
                      className="flex flex-col"
                      style={{
                        alignItems: msg.isOwn ? "flex-end" : "flex-start",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {/* Sender name */}
                      {showSender && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "var(--foreground)",
                            marginBottom: 2,
                          }}
                        >
                          {msg.senderName}
                        </span>
                      )}

                      {/* Reply-to */}
                      {msg.replyTo && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--muted-foreground)",
                            padding: "4px 12px",
                            borderRadius: "var(--radius)",
                            background: "var(--muted)",
                            borderLeft: "2px solid var(--primary)",
                            marginBottom: 4,
                            maxWidth: "100%",
                          }}
                          className="truncate"
                        >
                          <span style={{ fontWeight: 600 }}>
                            {msg.replyTo.senderName}:
                          </span>{" "}
                          {msg.replyTo.content}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className="relative"
                        style={{
                          padding: "10px 16px",
                          borderRadius: "calc(var(--radius) + 6px)",
                          ...(msg.isOwn
                            ? {
                                background: "var(--primary)",
                                color: "var(--primary-foreground)",
                                borderBottomRightRadius: "calc(var(--radius))",
                              }
                            : {
                                background: "var(--secondary)",
                                color: "var(--foreground)",
                                borderBottomLeftRadius: "calc(var(--radius))",
                              }),
                          fontSize: "var(--text-sm)",
                          fontWeight: "var(--font-weight-normal)" as any,
                          lineHeight: 1.6,
                          maxWidth: "100%",
                          wordBreak: "break-word" as const,
                        }}
                      >
                        {msg.content}

                        {/* Attachment */}
                        {msg.attachment && (
                          <div
                            className="flex items-center gap-2 mt-2"
                            style={{
                              padding: "8px 12px",
                              borderRadius: "var(--radius)",
                              background: msg.isOwn
                                ? "color-mix(in srgb, var(--primary-foreground) 15%, transparent)"
                                : "var(--background)",
                              border: msg.isOwn ? "none" : "1px solid var(--border)",
                            }}
                          >
                            <span style={{ fontSize: "12px" }}>📄</span>
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate"
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  margin: 0,
                                }}
                              >
                                {msg.attachment.name}
                              </p>
                              <span style={{ fontSize: "10px", opacity: 0.7 }}>
                                {msg.attachment.size}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Hover actions */}
                        <div
                          className="absolute opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-0.5"
                          style={{
                            top: -14,
                            ...(msg.isOwn ? { left: 0 } : { right: 0 }),
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "3px 5px",
                            boxShadow: "var(--elevation-sm)",
                          }}
                        >
                          {["😊", "👍", "❤️"].map((emoji) => (
                            <button
                              key={emoji}
                              className="p-0.5 rounded-sm transition-colors"
                              style={{ fontSize: "13px", lineHeight: 1 }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "var(--accent)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "transparent")
                              }
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            className="p-0.5 rounded-sm transition-colors"
                            style={{
                              color: "var(--muted-foreground)",
                              fontSize: "12px",
                              lineHeight: 1,
                            }}
                            onClick={() =>
                              setReplyTo({
                                senderName: msg.senderName,
                                content: msg.content,
                              })
                            }
                            title="Reply"
                          >
                            ↩
                          </button>
                        </div>
                      </div>

                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1" style={{ marginTop: 4 }}>
                          {msg.reactions.map((r, ri) => (
                            <button
                              key={ri}
                              className="flex items-center gap-1 rounded-full transition-colors"
                              style={{
                                padding: "2px 8px",
                                fontSize: "12px",
                                border: r.reacted
                                  ? "1px solid var(--primary)"
                                  : "1px solid var(--border)",
                                background: r.reacted
                                  ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                                  : "var(--card)",
                              }}
                            >
                              <span>{r.emoji}</span>
                              <span
                                style={{
                                  fontWeight: 500,
                                  color: r.reacted
                                    ? "var(--primary)"
                                    : "var(--muted-foreground)",
                                }}
                              >
                                {r.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div
                        className="flex items-center gap-1.5"
                        style={{ marginTop: 3, padding: "0 2px" }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {msg.timeLabel}
                        </span>
                        {msg.isEdited && (
                          <span
                            style={{
                              fontSize: "10px",
                              color: "var(--muted-foreground)",
                              fontStyle: "italic",
                            }}
                          >
                            (edited)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Composer ──────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <MessageComposer
            onSend={handleSend}
            placeholder={`Message ${fallbackChannel.name}...`}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        </div>
      </div>
    </div>
  );
}