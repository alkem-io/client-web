import { useState, useRef, useCallback } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
  replyTo?: { senderName: string; content: string } | null;
  onCancelReply?: () => void;
}

export function MessageComposer({
  onSend,
  placeholder = "Type a message...",
  replyTo,
  onCancelReply,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    setShowToolbar(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, []);

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--card)",
        padding: "12px 16px",
      }}
    >
      {/* Reply preview */}
      {replyTo && (
        <div
          className="flex items-start gap-2"
          style={{
            padding: "8px 12px",
            marginBottom: 8,
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
              {replyTo.senderName}
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

      {/* Formatting toolbar */}
      {showToolbar && (
        <div
          className="flex items-center gap-0.5"
          style={{
            marginBottom: 6,
            padding: "4px 0",
          }}
        >
          {[Bold, Italic, Strikethrough, Code, Link2].map((Icon, i) => (
            <button
              key={i}
              className="p-1.5 rounded-sm transition-colors"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--foreground)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--muted-foreground)")
              }
            >
              <Icon style={{ width: 14, height: 14 }} />
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <button
          onClick={() => {}}
          className="shrink-0 p-1.5 rounded-md transition-colors"
          style={{ color: "var(--muted-foreground)" }}
          title="Attach file"
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
            onChange={(e) => setText(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowToolbar(true)}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none outline-none bg-transparent"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--foreground)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: "var(--font-weight-normal)" as any,
              lineHeight: 1.5,
              padding: "8px 0",
              maxHeight: 120,
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
            text.trim()
              ? "opacity-100"
              : "opacity-40 cursor-not-allowed"
          )}
          style={{
            background: text.trim() ? "var(--primary)" : "var(--muted)",
            color: text.trim()
              ? "var(--primary-foreground)"
              : "var(--muted-foreground)",
          }}
          title="Send message"
        >
          <Send style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
}
