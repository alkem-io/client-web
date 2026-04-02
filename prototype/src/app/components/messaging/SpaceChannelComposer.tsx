import { useState, useRef, useCallback, useEffect } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link2,
  List,
  ListOrdered,
  X,
  AtSign,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UserInfo } from "./messagingData";
import { ALL_USERS } from "./messagingData";

interface SpaceChannelComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
  replyTo?: { senderName: string; content: string } | null;
  onCancelReply?: () => void;
}

export function SpaceChannelComposer({
  onSend,
  placeholder = "Type a message...",
  replyTo,
  onCancelReply,
}: SpaceChannelComposerProps) {
  const [text, setText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredUsers: UserInfo[] = mentionQuery
    ? ALL_USERS.filter((u) =>
        u.name.toLowerCase().includes(mentionQuery.toLowerCase())
      ).slice(0, 5)
    : ALL_USERS.slice(0, 5);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showMentions) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setMentionIndex((i) => Math.min(i + 1, filteredUsers.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setMentionIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          if (filteredUsers[mentionIndex]) {
            insertMention(filteredUsers[mentionIndex]);
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setShowMentions(false);
          return;
        }
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, showMentions, filteredUsers, mentionIndex]
  );

  const insertMention = useCallback(
    (user: UserInfo) => {
      const cursorPos = textareaRef.current?.selectionStart ?? text.length;
      const beforeCursor = text.substring(0, cursorPos);
      const atIdx = beforeCursor.lastIndexOf("@");
      if (atIdx === -1) return;
      const before = text.substring(0, atIdx);
      const after = text.substring(cursorPos);
      setText(`${before}@${user.name} ${after}`);
      setShowMentions(false);
      setMentionQuery("");
      setMentionIndex(0);
      setTimeout(() => {
        const newPos = before.length + user.name.length + 2;
        textareaRef.current?.setSelectionRange(newPos, newPos);
        textareaRef.current?.focus();
      }, 0);
    },
    [text]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setText(val);
      const cursorPos = e.target.selectionStart ?? val.length;
      const beforeCursor = val.substring(0, cursorPos);
      const atIdx = beforeCursor.lastIndexOf("@");
      if (atIdx !== -1) {
        const charBefore = atIdx > 0 ? beforeCursor[atIdx - 1] : " ";
        if (charBefore === " " || charBefore === "\n" || atIdx === 0) {
          const query = beforeCursor.substring(atIdx + 1);
          if (!query.includes(" ") || query.length < 20) {
            setShowMentions(true);
            setMentionQuery(query);
            setMentionIndex(0);
            return;
          }
        }
      }
      setShowMentions(false);
    },
    []
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
    }
  }, []);

  // Toolbar actions (decorative for prototype)
  const toolbarButtons = [
    { icon: Bold, label: "Bold (Cmd+B)" },
    { icon: Italic, label: "Italic (Cmd+I)" },
    { icon: Strikethrough, label: "Strikethrough" },
    { icon: Code, label: "Code" },
    { icon: Link2, label: "Link" },
    { icon: List, label: "Bulleted list" },
    { icon: ListOrdered, label: "Numbered list" },
  ];

  return (
    <div
      className="shrink-0"
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--card)",
        padding: "12px 20px 16px",
      }}
    >
      {/* Reply preview */}
      {replyTo && (
        <div
          className="flex items-start gap-2"
          style={{
            padding: "8px 12px",
            marginBottom: 10,
            borderRadius: "var(--radius)",
            background: "var(--secondary)",
            borderLeft: "3px solid var(--primary)",
          }}
        >
          <div className="flex-1 min-w-0">
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--primary)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Replying to {replyTo.senderName}
            </span>
            <p
              className="truncate"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--muted-foreground)",
                margin: 0,
                lineHeight: 1.4,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {replyTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="shrink-0 p-0.5 rounded-sm transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      {/* Rich text toolbar — always visible */}
      <div
        className="flex items-center gap-0.5"
        style={{
          marginBottom: 8,
          padding: "2px 0",
        }}
      >
        {toolbarButtons.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="p-1.5 rounded-sm transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            title={label}
          >
            <Icon style={{ width: 15, height: 15 }} />
          </button>
        ))}
        <div
          className="mx-1"
          style={{
            width: 1,
            height: 16,
            background: "var(--border)",
          }}
        />
        <button
          className="p-1.5 rounded-sm transition-colors"
          style={{ color: "var(--muted-foreground)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          title="Mention someone (@)"
          onClick={() => {
            const el = textareaRef.current;
            if (el) {
              const pos = el.selectionStart ?? text.length;
              const before = text.substring(0, pos);
              const after = text.substring(pos);
              const needsSpace = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
              const newText = `${before}${needsSpace ? " " : ""}@${after}`;
              setText(newText);
              setShowMentions(true);
              setMentionQuery("");
              setMentionIndex(0);
              setTimeout(() => {
                const newPos = before.length + (needsSpace ? 2 : 1);
                el.setSelectionRange(newPos, newPos);
                el.focus();
              }, 0);
            }
          }}
        >
          <AtSign style={{ width: 15, height: 15 }} />
        </button>
      </div>

      {/* Input row with @mention autocomplete */}
      <div className="relative">
        {/* @mention dropdown */}
        {showMentions && filteredUsers.length > 0 && (
          <div
            className="absolute bottom-full left-0 right-0 z-20"
            style={{
              marginBottom: 4,
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              boxShadow: "var(--elevation-sm)",
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                padding: "6px 10px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Members
              </span>
            </div>
            {filteredUsers.map((user, idx) => (
              <button
                key={user.id}
                onClick={() => insertMention(user)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 transition-colors text-left",
                  idx === mentionIndex
                    ? ""
                    : ""
                )}
                style={{
                  background:
                    idx === mentionIndex ? "var(--accent)" : "transparent",
                }}
                onMouseEnter={() => setMentionIndex(idx)}
              >
                <Avatar
                  style={{
                    width: 28,
                    height: 28,
                    border: "1px solid var(--border)",
                  }}
                >
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback
                    style={{
                      fontSize: "9px",
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span
                    className="truncate"
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 500,
                      color: "var(--foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {user.name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {user.status === "online" ? "Online" : "Offline"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => {}}
            className="shrink-0 p-1.5 rounded-md transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            title="Attach file (max 25MB)"
          >
            <Paperclip style={{ width: 18, height: 18 }} />
          </button>

          <div
            className="flex-1 relative"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius) + 4px)",
              padding: "0 12px",
            }}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="w-full resize-none outline-none bg-transparent"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--foreground)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: "var(--font-weight-normal)" as any,
                lineHeight: 1.5,
                padding: "10px 0",
                maxHeight: 140,
              }}
              aria-label="Message input"
            />
          </div>

          <button
            onClick={() => {}}
            className="shrink-0 p-1.5 rounded-md transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            title="Emoji"
          >
            <Smile style={{ width: 18, height: 18 }} />
          </button>

          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={cn(
              "shrink-0 p-2 rounded-full transition-all",
              text.trim() ? "opacity-100" : "opacity-40 cursor-not-allowed"
            )}
            style={{
              background: text.trim() ? "var(--primary)" : "var(--muted)",
              color: text.trim()
                ? "var(--primary-foreground)"
                : "var(--muted-foreground)",
            }}
            title="Send message (Enter)"
          >
            <Send style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
