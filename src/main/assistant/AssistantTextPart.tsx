import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { useThrottledValue } from './useThrottledValue';

/**
 * Markdown re-parse cadence while streaming (T032). `WrapperMarkdown` re-parses
 * the *whole* accumulated buffer on every change, so a per-token re-parse is
 * O(n²) over a turn. ~75ms (~13fps) is the tuned sweet spot: visibly smooth
 * progressive text without thrashing the parser under fast token streams. The
 * trailing-edge throttle still emits the final buffer once the turn settles.
 */
const STREAMING_REPARSE_MS = 75;

/**
 * Renders a streamed text part as markdown, throttling the re-parse while
 * streaming (FR-004; T011/T032). Settled turns render immediately (0ms).
 *
 * Reply-language passthrough (FR-020 / T029): the server text is rendered
 * **verbatim** — no `t()`, no `i18n.language`-driven transformation. The
 * assistant replies in the language of the user's message, independent of the
 * UI locale, so the client must never coerce the assistant prose.
 */
export const AssistantTextPart = ({ text, streaming }: { text: string; streaming?: boolean }) => {
  // Only throttle while actively streaming; settled turns render immediately.
  const throttledText = useThrottledValue(text, streaming ? STREAMING_REPARSE_MS : 0);
  return <WrapperMarkdown>{throttledText}</WrapperMarkdown>;
};
