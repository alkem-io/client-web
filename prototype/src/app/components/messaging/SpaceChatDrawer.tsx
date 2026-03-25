import { useRef, useEffect, useCallback, useState } from "react";
import { GripVertical } from "lucide-react";
import { ChatView } from "./ChatView";
import { CONVERSATIONS, type Conversation } from "./messagingData";

const MIN_WIDTH = 300;
const DEFAULT_WIDTH = 360;
const MAX_WIDTH_RATIO = 0.5;

interface SpaceChatDrawerProps {
  spaceSlug: string;
  onClose?: () => void;
  onViewInHub?: () => void;
}

export function SpaceChatDrawer({ spaceSlug, onClose, onViewInHub }: SpaceChatDrawerProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(width);
  const [isDragging, setIsDragging] = useState(false);

  // Find matching space channel
  const channel: Conversation | undefined = CONVERSATIONS.find(
    (c) => c.type === "space" && c.spaceSlug === spaceSlug
  );

  const fallbackChannel: Conversation = channel ?? {
    id: `space-${spaceSlug}`,
    type: "space",
    name: spaceSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      setIsDragging(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      // Dragging left (smaller clientX) → wider drawer
      const delta = startX.current - e.clientX;
      const newWidth = startWidth.current + delta;
      const maxWidth = Math.floor(window.innerWidth * MAX_WIDTH_RATIO);
      setWidth(Math.max(MIN_WIDTH, Math.min(newWidth, maxWidth)));
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        setIsDragging(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setWidth]);

  // Keyboard resize support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setWidth(width + 20);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setWidth(width - 20);
      }
    },
    [width, setWidth]
  );

  return (
    <div
      className="flex shrink-0"
      style={{
        width,
        height: "100%",
        transition: isDragging ? "none" : "width 0.25s ease",
      }}
    >
      {/* ── Resize Handle ─────────────────────────────────────────────── */}
      <div
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        role="separator"
        aria-label="Resize chat drawer"
        aria-orientation="vertical"
        tabIndex={0}
        className="shrink-0 flex items-center justify-center cursor-col-resize group/handle relative"
        style={{
          width: 4,
          background: "transparent",
          margin: 0,
          padding: 0,
        }}
      >
        {/* Visible line */}
        <div
          className="absolute inset-y-0 transition-colors"
          style={{
            width: 1,
            left: 1,
            background: isDragging ? "var(--primary)" : "var(--border)",
          }}
        />
        {/* Grip dots — visible on hover */}
        <div
          className="relative z-10 opacity-0 group-hover/handle:opacity-100 transition-opacity flex items-center justify-center rounded-sm"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            padding: "4px 1px",
            boxShadow: "var(--elevation-sm)",
          }}
        >
          <GripVertical
            style={{
              width: 12,
              height: 12,
              color: "var(--muted-foreground)",
            }}
          />
        </div>
      </div>

      {/* ── Chat Content ──────────────────────────────────────────────── */}
      <div
        className="flex-1 min-w-0 flex flex-col"
        style={{
          background: "var(--background)",
          borderLeft: "1px solid var(--border)",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <ChatView
          conversation={fallbackChannel}
          onBack={onClose}
          onViewInHub={onViewInHub}
          compact={width < 360}
          closeIcon
        />
      </div>
    </div>
  );
}