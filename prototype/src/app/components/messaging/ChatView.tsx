import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Users,
  BellOff,
  ExternalLink,
  LogOut,
  User as UserIcon,
  Hash,
  X,
  Search as SearchIcon,
  SquareArrowOutUpRight,
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
import { MESSAGES, USERS } from "./messagingData";

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  /** for space channels: "View in Messages" action */
  onViewInHub?: () => void;
  /** compact = inside space side panel or narrow drawer */
  compact?: boolean;
  /** show X instead of back arrow (used in persistent drawer) */
  closeIcon?: boolean;
  /** Variant D: navigate to the Space page */
  onVisitSpace?: () => void;
}

export function ChatView({
  conversation,
  onBack,
  onViewInHub,
  compact = false,
  closeIcon = false,
  onVisitSpace,
}: ChatViewProps) {
  const messages = MESSAGES[conversation.id] ?? [];
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [replyTo, setReplyTo] = useState<{
    senderName: string;
    content: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMessages(MESSAGES[conversation.id] ?? []);
  }, [conversation.id]);

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

  const isGroup = conversation.type === "group";
  const isSpace = conversation.type === "space";
  const showSenderInfo = isGroup || isSpace;

  // Group consecutive messages from same sender
  const shouldShowSender = (msg: Message, idx: number) => {
    if (!showSenderInfo || msg.isOwn) return false;
    if (idx === 0) return true;
    const prev = localMessages[idx - 1];
    return prev.senderId !== msg.senderId || prev.dateLabel !== msg.dateLabel;
  };

  // Date separators
  const shouldShowDate = (msg: Message, idx: number) => {
    if (idx === 0) return true;
    return localMessages[idx - 1].dateLabel !== msg.dateLabel;
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--background)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 shrink-0"
        style={{
          padding: compact ? "10px 14px" : "12px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <button
          onClick={onBack}
          className="shrink-0 p-1 rounded-md transition-colors"
          style={{ color: "var(--muted-foreground)" }}
          aria-label={closeIcon ? "Close chat drawer" : "Back to conversations"}
        >
          {closeIcon ? (
            <X style={{ width: 18, height: 18 }} />
          ) : (
            <ArrowLeft style={{ width: 18, height: 18 }} />
          )}
        </button>

        {/* Avatar */}
        {conversation.type === "dm" ? (
          <Avatar
            style={{
              width: 36,
              height: 36,
              border: "1px solid var(--border)",
            }}
          >
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
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius:
                conversation.type === "group"
                  ? "calc(var(--radius) + 2px)"
                  : "calc(var(--radius) + 2px)",
              background: conversation.avatarColor ?? "var(--secondary)",
              color: "var(--primary-foreground)",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {isSpace ? (
              <Hash style={{ width: 16, height: 16 }} />
            ) : (
              conversation.initials
            )}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="truncate"
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {conversation.name}
            </span>
            {conversation.type === "dm" && conversation.isOnline && (
              <span
                className="shrink-0 rounded-full"
                style={{
                  width: 7,
                  height: 7,
                  background: "var(--success)",
                }}
              />
            )}
          </div>
          {(isGroup || isSpace) && conversation.memberCount && (
            <span
              style={{
                fontSize: "11px",
                color: "var(--muted-foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {conversation.memberCount} members
            </span>
          )}
        </div>

        {/* Visit Space quick-action (Variant D) */}
        {onVisitSpace && isSpace && (
          <button
            onClick={onVisitSpace}
            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--primary)",
              background: "color-mix(in srgb, var(--primary) 8%, transparent)",
              border: "1px solid color-mix(in srgb, var(--primary) 15%, transparent)",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 14%, transparent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 8%, transparent)")
            }
            title="Visit this Space"
            aria-label={`Visit ${conversation.name} Space`}
          >
            <SquareArrowOutUpRight style={{ width: 12, height: 12 }} />
            <span>Visit</span>
          </button>
        )}

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="shrink-0 p-1.5 rounded-md transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              <MoreVertical style={{ width: 16, height: 16 }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ minWidth: 180 }}>
            {conversation.type === "dm" && (
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <UserIcon style={{ width: 14, height: 14 }} />
                <span style={{ fontSize: "var(--text-sm)", fontFamily: "'Inter', sans-serif" }}>
                  View Profile
                </span>
              </DropdownMenuItem>
            )}
            {isGroup && (
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Users style={{ width: 14, height: 14 }} />
                <span style={{ fontSize: "var(--text-sm)", fontFamily: "'Inter', sans-serif" }}>
                  Manage Members
                </span>
              </DropdownMenuItem>
            )}
            {isSpace && (
              <>
                {onViewInHub && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={onViewInHub}
                  >
                    <ExternalLink style={{ width: 14, height: 14 }} />
                    <span style={{ fontSize: "var(--text-sm)", fontFamily: "'Inter', sans-serif" }}>
                      View in Messages
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Users style={{ width: 14, height: 14 }} />
                  <span style={{ fontSize: "var(--text-sm)", fontFamily: "'Inter', sans-serif" }}>
                    View Members
                  </span>
                </DropdownMenuItem>
                {onVisitSpace && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={onVisitSpace}
                  >
                    <SquareArrowOutUpRight style={{ width: 14, height: 14 }} />
                    <span style={{ fontSize: "var(--text-sm)", fontFamily: "'Inter', sans-serif" }}>
                      Visit Space
                    </span>
                  </DropdownMenuItem>
                )}
              </>
            )}
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <BellOff style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: "var(--text-sm)", fontFamily: "'Inter', sans-serif" }}>
                Mute Notifications
              </span>
            </DropdownMenuItem>
            {isGroup && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  style={{ color: "var(--destructive)" }}
                >
                  <LogOut style={{ width: 14, height: 14 }} />
                  <span style={{ fontSize: "var(--text-sm)", fontFamily: "'Inter', sans-serif" }}>
                    Leave Group
                  </span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Stacked member avatars for groups */}
        {isGroup && conversation.members && !compact && (
          <div className="flex -space-x-1.5 shrink-0">
            {conversation.members.slice(0, 3).map((m) => (
              <Avatar
                key={m.id}
                style={{
                  width: 22,
                  height: 22,
                  border: "2px solid var(--card)",
                }}
              >
                <AvatarImage src={m.avatar} alt={m.name} />
                <AvatarFallback
                  style={{
                    fontSize: "8px",
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {m.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
      </div>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ padding: compact ? "16px 14px" : "20px 16px" }}
      >
        {localMessages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full text-center"
            style={{ padding: "40px 20px" }}
          >
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--muted-foreground)",
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.6,
              }}
            >
              {isSpace
                ? `This is the ${conversation.name} channel. Start a conversation with your Space team! 👋`
                : isGroup
                ? `Welcome to ${conversation.name}! Start the conversation. 💬`
                : `This is the start of your conversation with ${conversation.name}. Say hello! 👋`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {localMessages.map((msg, idx) => {
              const showDate = shouldShowDate(msg, idx);
              const showSender = shouldShowSender(msg, idx);

              return (
                <div key={msg.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div
                      className="flex items-center justify-center"
                      style={{ padding: "16px 0 12px" }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "var(--muted-foreground)",
                          background: "var(--secondary)",
                          padding: "3px 12px",
                          borderRadius: "999px",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {msg.dateLabel}
                      </span>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={cn(
                      "flex gap-2 group/msg",
                      msg.isOwn ? "justify-end" : "justify-start"
                    )}
                    style={{
                      padding: showSender ? "8px 0 2px" : "2px 0",
                      maxWidth: "85%",
                      marginLeft: msg.isOwn ? "auto" : undefined,
                    }}
                  >
                    {/* Avatar (others, first in group) */}
                    {!msg.isOwn && showSenderInfo && (
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {showSender && (
                          <Avatar
                            style={{
                              width: 28,
                              height: 28,
                              border: "1px solid var(--border)",
                            }}
                          >
                            <AvatarImage
                              src={msg.senderAvatar}
                              alt={msg.senderName}
                            />
                            <AvatarFallback
                              style={{
                                fontSize: "9px",
                                fontWeight: 600,
                                fontFamily: "'Inter', sans-serif",
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
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "var(--foreground)",
                            marginBottom: 2,
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {msg.senderName}
                        </span>
                      )}

                      {/* Reply-to */}
                      {msg.replyTo && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--muted-foreground)",
                            padding: "4px 10px",
                            borderRadius: "var(--radius)",
                            background: "var(--muted)",
                            borderLeft: "2px solid var(--primary)",
                            marginBottom: 4,
                            maxWidth: "100%",
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

                      {/* Bubble */}
                      <div
                        className="relative"
                        style={{
                          padding: "8px 14px",
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
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: "var(--font-weight-normal)" as any,
                          lineHeight: 1.55,
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
                              padding: "6px 10px",
                              borderRadius: "var(--radius)",
                              background: msg.isOwn
                                ? "color-mix(in srgb, var(--primary-foreground) 15%, transparent)"
                                : "var(--background)",
                              border: msg.isOwn
                                ? "none"
                                : "1px solid var(--border)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "11px",
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              📄
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate"
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  margin: 0,
                                  fontFamily: "'Inter', sans-serif",
                                }}
                              >
                                {msg.attachment.name}
                              </p>
                              <span
                                style={{
                                  fontSize: "10px",
                                  opacity: 0.7,
                                  fontFamily: "'Inter', sans-serif",
                                }}
                              >
                                {msg.attachment.size}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Hover actions */}
                        <div
                          className="absolute opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-0.5"
                          style={{
                            top: -12,
                            ...(msg.isOwn ? { left: 0 } : { right: 0 }),
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "2px 4px",
                            boxShadow: "var(--elevation-sm)",
                          }}
                        >
                          {["😊", "👍", "❤️"].map((emoji) => (
                            <button
                              key={emoji}
                              className="p-0.5 rounded-sm transition-colors"
                              style={{ fontSize: "12px", lineHeight: 1 }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--accent)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            className="p-0.5 rounded-sm transition-colors"
                            style={{
                              color: "var(--muted-foreground)",
                              fontSize: "11px",
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
                        <div
                          className="flex flex-wrap gap-1"
                          style={{ marginTop: 4 }}
                        >
                          {msg.reactions.map((r, ri) => (
                            <button
                              key={ri}
                              className="flex items-center gap-1 rounded-full transition-colors"
                              style={{
                                padding: "1px 8px",
                                fontSize: "11px",
                                border: r.reacted
                                  ? "1px solid var(--primary)"
                                  : "1px solid var(--border)",
                                background: r.reacted
                                  ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                                  : "var(--card)",
                                fontFamily: "'Inter', sans-serif",
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

                      {/* Timestamp + edited */}
                      <div
                        className="flex items-center gap-1.5"
                        style={{ marginTop: 3, padding: "0 2px" }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--muted-foreground)",
                            fontFamily: "'Inter', sans-serif",
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
                              fontFamily: "'Inter', sans-serif",
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

      {/* ── Composer ─────────────────────────────────────────────────────── */}
      <MessageComposer
        onSend={handleSend}
        placeholder={
          isSpace
            ? `Message ${conversation.name}...`
            : isGroup
            ? `Message ${conversation.name}...`
            : `Message ${conversation.name}...`
        }
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}