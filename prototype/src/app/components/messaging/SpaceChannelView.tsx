import { useState, useRef, useEffect, useCallback } from "react";
import {
  Hash,
  Search,
  X,
  Users,
  MoreVertical,
  BellOff,
  Clock,
  MessageCircle,
  Pencil,
  ChevronDown,
  Loader2,
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
import { SpaceChannelComposer } from "./SpaceChannelComposer";
import type { Conversation, Message } from "./messagingData";
import { CONVERSATIONS, MESSAGES, USERS } from "./messagingData";
import { useNavigate } from "react-router";

interface SpaceChannelViewProps {
  spaceSlug: string;
}

export function SpaceChannelView({ spaceSlug }: SpaceChannelViewProps) {
  const navigate = useNavigate();

  // Find channel data
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
  const [replyTo, setReplyTo] = useState<{
    senderName: string;
    content: string;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessageToast, setShowNewMessageToast] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useRef(true);

  useEffect(() => {
    setLocalMessages(MESSAGES[fallbackChannel.id] ?? []);
  }, [fallbackChannel.id]);

  // Scroll to bottom on new messages if near bottom
  useEffect(() => {
    if (scrollRef.current) {
      if (isNearBottom.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        setShowNewMessageToast(false);
      } else {
        setShowNewMessageToast(true);
      }
    }
  }, [localMessages]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isNearBottom.current = scrollHeight - scrollTop - clientHeight < 80;
    if (isNearBottom.current) {
      setShowNewMessageToast(false);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    setShowNewMessageToast(false);
  }, []);

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
      isNearBottom.current = true;
    },
    [replyTo]
  );

  const handleEditSave = useCallback(
    (msgId: string) => {
      const trimmed = editText.trim();
      if (!trimmed) return;
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, content: trimmed, isEdited: true } : m
        )
      );
      setEditingId(null);
      setEditText("");
    },
    [editText]
  );

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => setLoadingMore(false), 800);
  }, []);

  // Date separators
  const shouldShowDate = (msg: Message, idx: number) => {
    if (idx === 0) return true;
    return localMessages[idx - 1].dateLabel !== msg.dateLabel;
  };

  // Sender grouping — collapse consecutive messages from same sender within same date
  const shouldShowSender = (msg: Message, idx: number) => {
    if (idx === 0) return true;
    const prev = localMessages[idx - 1];
    return prev.senderId !== msg.senderId || prev.dateLabel !== msg.dateLabel;
  };

  // Relative timestamp
  const getRelativeTime = (timeLabel: string, dateLabel: string) => {
    if (dateLabel === "Today") return timeLabel;
    if (dateLabel === "Yesterday") return `Yesterday at ${timeLabel}`;
    return `${dateLabel} at ${timeLabel}`;
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
      style={{ background: "var(--background)", minHeight: 0 }}
    >
      {/* ── Channel Header ───────────────────────────────────────── */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 38,
              height: 38,
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
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {fallbackChannel.name}
              </span>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--muted-foreground)",
                  fontWeight: "var(--font-weight-normal)" as any,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                — Chat
              </span>
            </div>
            <button
              onClick={() => navigate(`/space/${spaceSlug}/community`)}
              className="transition-colors"
              style={{
                fontSize: "12px",
                color: "var(--muted-foreground)",
                fontFamily: "'Inter', sans-serif",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--muted-foreground)")
              }
            >
              {fallbackChannel.memberCount ?? 0} members
            </button>
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
            style={{
              color: isSearching ? "var(--primary)" : "var(--muted-foreground)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            title="Search in channel"
          >
            <Search style={{ width: 16, height: 16 }} />
          </button>

          {/* View Members */}
          <button
            onClick={() => navigate(`/space/${spaceSlug}/community`)}
            className="p-2 rounded-md transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
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
            <DropdownMenuContent align="end" style={{ minWidth: 200 }}>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => navigate(`/space/${spaceSlug}/community`)}
              >
                <Users style={{ width: 14, height: 14 }} />
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  View Members
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <BellOff style={{ width: 14, height: 14 }} />
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Mute Notifications
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Clock style={{ width: 14, height: 14 }} />
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Do Not Disturb
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Inline Search Bar ────────────────────────────────────── */}
      {isSearching && (
        <div
          className="flex items-center gap-2 shrink-0"
          style={{
            padding: "8px 24px",
            borderBottom: "1px solid var(--border)",
            background:
              "color-mix(in srgb, var(--primary) 3%, var(--background))",
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
              fontFamily: "'Inter', sans-serif",
            }}
          />
          {searchQuery && (
            <span
              style={{
                fontSize: "11px",
                color: "var(--muted-foreground)",
                whiteSpace: "nowrap",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {filteredMessages.length} result
              {filteredMessages.length !== 1 ? "s" : ""}
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

      {/* ── Message Thread ────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative"
        style={{ padding: "0" }}
        role="log"
        aria-live="polite"
        aria-label="Channel messages"
      >
        {filteredMessages.length === 0 ? (
          /* ── Empty State ─────────────────────────────────────────── */
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
                    fontFamily: "'Inter', sans-serif",
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
                    width: 64,
                    height: 64,
                    background:
                      "color-mix(in srgb, var(--primary) 8%, transparent)",
                    marginBottom: 20,
                  }}
                >
                  <MessageCircle
                    style={{
                      width: 32,
                      height: 32,
                      color: "var(--primary)",
                      opacity: 0.6,
                    }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: "var(--text-xl)",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: 8,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Welcome to {fallbackChannel.name} chat!
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.7,
                    maxWidth: 420,
                    marginBottom: 24,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  This is a shared conversation for all Space members. Start the
                  discussion.
                </p>
                <div className="flex items-center gap-3">
                  {["Introduce yourself", "Share what you're working on"].map(
                    (prompt) => (
                      <button
                        key={prompt}
                        className="rounded-full transition-colors"
                        style={{
                          padding: "8px 20px",
                          fontSize: "var(--text-sm)",
                          fontWeight: "var(--font-weight-medium)" as any,
                          background: "var(--secondary)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                          fontFamily: "'Inter', sans-serif",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--accent)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "var(--secondary)")
                        }
                      >
                        {prompt}
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {/* Load more button */}
            <div className="flex justify-center" style={{ padding: "16px 0 8px" }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-full transition-colors"
                style={{
                  padding: "6px 18px",
                  fontSize: "12px",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--muted-foreground)",
                  background: "var(--secondary)",
                  border: "1px solid var(--border)",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--secondary)")
                }
              >
                {loadingMore ? (
                  <Loader2
                    className="animate-spin"
                    style={{ width: 13, height: 13 }}
                  />
                ) : null}
                {loadingMore ? "Loading..." : "Load earlier messages"}
              </button>
            </div>

            {/* Messages — LEFT-ALIGNED ROW LAYOUT */}
            {filteredMessages.map((msg, idx) => {
              const showDate = shouldShowDate(msg, idx);
              const showSender = shouldShowSender(msg, idx);
              const isEditing = editingId === msg.id;

              return (
                <div key={msg.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div
                      className="flex items-center justify-center"
                      style={{ padding: "24px 0 16px" }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "var(--font-weight-medium)" as any,
                          color: "var(--muted-foreground)",
                          background: "var(--secondary)",
                          padding: "4px 16px",
                          borderRadius: "999px",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {msg.dateLabel}
                      </span>
                    </div>
                  )}

                  {/* Message row — ALL left-aligned */}
                  <div
                    className={cn(
                      "group/msg flex gap-3 transition-colors relative",
                      msg.isOwn ? "" : ""
                    )}
                    style={{
                      padding: showSender ? "12px 24px 4px" : "4px 24px",
                      background: msg.isOwn
                        ? "color-mix(in srgb, var(--primary) 3%, transparent)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!msg.isOwn)
                        e.currentTarget.style.background = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = msg.isOwn
                        ? "color-mix(in srgb, var(--primary) 3%, transparent)"
                        : "transparent";
                    }}
                  >
                    {/* Avatar — show for first message in group */}
                    <div style={{ width: 36, flexShrink: 0, paddingTop: 2 }}>
                      {showSender && (
                        <Avatar
                          style={{
                            width: 36,
                            height: 36,
                            border: "1px solid var(--border)",
                          }}
                        >
                          <AvatarImage
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                          />
                          <AvatarFallback
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {msg.senderInitials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      {/* Sender name + timestamp row */}
                      {showSender && (
                        <div
                          className="flex items-baseline gap-2"
                          style={{ marginBottom: 2 }}
                        >
                          <span
                            style={{
                              fontSize: "var(--text-sm)",
                              fontWeight: 600,
                              color: "var(--foreground)",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {msg.senderName}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--muted-foreground)",
                              fontFamily: "'Inter', sans-serif",
                            }}
                            title={getRelativeTime(msg.timeLabel, msg.dateLabel)}
                          >
                            {msg.timeLabel}
                          </span>
                          {msg.isEdited && (
                            <span
                              style={{
                                fontSize: "10px",
                                color: "var(--muted-foreground)",
                                fontStyle: "italic",
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              (edited)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Reply-to quote */}
                      {msg.replyTo && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--muted-foreground)",
                            padding: "6px 12px",
                            borderRadius: "var(--radius)",
                            background: "var(--muted)",
                            borderLeft: "3px solid var(--primary)",
                            marginBottom: 6,
                            maxWidth: 480,
                            fontFamily: "'Inter', sans-serif",
                          }}
                          className="truncate"
                        >
                          <span style={{ fontWeight: 600 }}>
                            {msg.replyTo.senderName}:
                          </span>{" "}
                          {msg.replyTo.content}
                        </div>
                      )}

                      {/* Message body — or edit form */}
                      {isEditing ? (
                        <div className="flex flex-col gap-2" style={{ maxWidth: 600 }}>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleEditSave(msg.id);
                              }
                              if (e.key === "Escape") {
                                setEditingId(null);
                                setEditText("");
                              }
                            }}
                            autoFocus
                            rows={2}
                            className="w-full resize-none outline-none rounded-md"
                            style={{
                              fontSize: "var(--text-sm)",
                              color: "var(--foreground)",
                              fontFamily: "'Inter', sans-serif",
                              lineHeight: 1.6,
                              padding: "8px 12px",
                              border: "1px solid var(--primary)",
                              background: "var(--input-background)",
                              borderRadius: "var(--radius)",
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditSave(msg.id)}
                              className="rounded-md transition-colors"
                              style={{
                                padding: "4px 14px",
                                fontSize: "12px",
                                fontWeight: "var(--font-weight-medium)" as any,
                                background: "var(--primary)",
                                color: "var(--primary-foreground)",
                                border: "none",
                                borderRadius: "var(--radius)",
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditText("");
                              }}
                              className="rounded-md transition-colors"
                              style={{
                                padding: "4px 14px",
                                fontSize: "12px",
                                fontWeight: "var(--font-weight-medium)" as any,
                                background: "transparent",
                                color: "var(--muted-foreground)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius)",
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              Cancel
                            </button>
                            <span
                              style={{
                                fontSize: "10px",
                                color: "var(--muted-foreground)",
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              Esc to cancel, Enter to save
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: "var(--text-sm)",
                            fontWeight: "var(--font-weight-normal)" as any,
                            color: "var(--foreground)",
                            lineHeight: 1.7,
                            fontFamily: "'Inter', sans-serif",
                            wordBreak: "break-word" as const,
                          }}
                        >
                          {/* Render @mentions as highlighted chips */}
                          {msg.content.split(/(@\w[\w\s]*?)(?=\s|$)/g).map(
                            (part, i) =>
                              part.startsWith("@") ? (
                                <span
                                  key={i}
                                  style={{
                                    color: "var(--primary)",
                                    fontWeight: 600,
                                    background:
                                      "color-mix(in srgb, var(--primary) 10%, transparent)",
                                    padding: "1px 4px",
                                    borderRadius: "var(--radius)",
                                    fontSize: "var(--text-sm)",
                                  }}
                                >
                                  {part}
                                </span>
                              ) : (
                                <span key={i}>{part}</span>
                              )
                          )}
                        </div>
                      )}

                      {/* Attachment */}
                      {msg.attachment && (
                        <div
                          className="flex items-center gap-2"
                          style={{
                            marginTop: 8,
                            padding: "10px 14px",
                            borderRadius: "var(--radius)",
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            maxWidth: 360,
                          }}
                        >
                          <span style={{ fontSize: "14px" }}>
                            {msg.attachment.type === "image"
                              ? "🖼️"
                              : msg.attachment.type === "audio"
                              ? "🎵"
                              : "📄"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate"
                              style={{
                                fontSize: "var(--text-sm)",
                                fontWeight: "var(--font-weight-medium)" as any,
                                margin: 0,
                                color: "var(--foreground)",
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {msg.attachment.name}
                            </p>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--muted-foreground)",
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {msg.attachment.size}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div
                          className="flex flex-wrap items-center gap-1.5"
                          style={{ marginTop: 6 }}
                        >
                          {msg.reactions.map((r, ri) => (
                            <button
                              key={ri}
                              className="flex items-center gap-1 rounded-full transition-colors"
                              style={{
                                padding: "2px 10px",
                                fontSize: "12px",
                                border: r.reacted
                                  ? "1px solid var(--primary)"
                                  : "1px solid var(--border)",
                                background: r.reacted
                                  ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                                  : "var(--card)",
                                fontFamily: "'Inter', sans-serif",
                              }}
                              title={
                                r.reacted
                                  ? `You and ${r.count - 1} others`
                                  : `${r.count} people reacted`
                              }
                            >
                              <span>{r.emoji}</span>
                              <span
                                style={{
                                  fontWeight: "var(--font-weight-medium)" as any,
                                  color: r.reacted
                                    ? "var(--primary)"
                                    : "var(--muted-foreground)",
                                }}
                              >
                                {r.count}
                              </span>
                            </button>
                          ))}
                          {/* Add reaction */}
                          <button
                            className="flex items-center justify-center rounded-full transition-colors"
                            style={{
                              width: 26,
                              height: 26,
                              fontSize: "13px",
                              border: "1px solid var(--border)",
                              background: "var(--card)",
                              color: "var(--muted-foreground)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--accent)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "var(--card)")
                            }
                            title="Add reaction"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Collapsed timestamp for grouped messages */}
                      {!showSender && (
                        <span
                          className="opacity-0 group-hover/msg:opacity-100 transition-opacity"
                          style={{
                            position: "absolute",
                            left: 24,
                            fontSize: "10px",
                            color: "var(--muted-foreground)",
                            fontFamily: "'Inter', sans-serif",
                            width: 36,
                            textAlign: "center",
                            marginTop: 2,
                          }}
                        >
                          {msg.timeLabel}
                        </span>
                      )}
                    </div>

                    {/* Hover actions — right side */}
                    <div
                      className="shrink-0 opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-start gap-0.5"
                      style={{ paddingTop: showSender ? 2 : 0 }}
                    >
                      {/* Emoji reactions */}
                      {["😊", "👍", "❤️"].map((emoji) => (
                        <button
                          key={emoji}
                          className="p-1 rounded-sm transition-colors"
                          style={{
                            fontSize: "13px",
                            lineHeight: 1,
                          }}
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
                      {/* Reply */}
                      <button
                        className="p-1 rounded-sm transition-colors"
                        style={{
                          color: "var(--muted-foreground)",
                          fontSize: "12px",
                          lineHeight: 1,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--accent)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
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
                      {/* Edit own message */}
                      {msg.isOwn && (
                        <button
                          className="p-1 rounded-sm transition-colors"
                          style={{
                            color: "var(--muted-foreground)",
                            lineHeight: 1,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--accent)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                          onClick={() => {
                            setEditingId(msg.id);
                            setEditText(msg.content);
                          }}
                          title="Edit message"
                        >
                          <Pencil style={{ width: 13, height: 13 }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom padding */}
            <div style={{ height: 16 }} />
          </div>
        )}

        {/* "New messages" toast */}
        {showNewMessageToast && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-4 left-1/2 flex items-center gap-1.5 rounded-full transition-all z-10"
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              padding: "6px 16px",
              fontSize: "12px",
              fontWeight: "var(--font-weight-medium)" as any,
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              boxShadow: "var(--elevation-sm)",
              border: "none",
              fontFamily: "'Inter', sans-serif",
              width: "fit-content",
              display: "flex",
            }}
          >
            New messages
            <ChevronDown style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {/* ── Composer ──────────────────────────────────────────────── */}
      <SpaceChannelComposer
        onSend={handleSend}
        placeholder={`Message ${fallbackChannel.name}...`}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}