import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ReadMoreTextProps {
  children: React.ReactNode;
  /** Max lines before truncation (default: 3) */
  maxLines?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Label for the expand button (default: "Read more") */
  readMoreLabel?: string;
  /** Label for the collapse button (default: "Show less") */
  showLessLabel?: string;
  /** Color for the toggle button text */
  toggleColor?: string;
  /** Opacity for the toggle button */
  toggleOpacity?: number;
}

const lineClampClass: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

export function ReadMoreText({
  children,
  maxLines = 3,
  className,
  style,
  readMoreLabel = "Read more",
  showLessLabel = "Show less",
  toggleColor,
  toggleOpacity,
}: ReadMoreTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [children]);

  const clampCls = lineClampClass[maxLines] ?? "line-clamp-3";

  return (
    <div>
      <p
        ref={textRef}
        className={cn(!isExpanded && clampCls, className)}
        style={style}
      >
        {children}
      </p>
      {(isTruncated || isExpanded) && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:underline mt-1 cursor-pointer"
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-medium)" as any,
            color: toggleColor ?? "inherit",
            opacity: toggleOpacity ?? 0.8,
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          {isExpanded ? showLessLabel : readMoreLabel}
        </button>
      )}
    </div>
  );
}
