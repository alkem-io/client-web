import type { VariantProps } from 'class-variance-authority';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/crd/lib/utils';
import { badgeVariants } from '@/crd/primitives/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

type TruncatedTagProps = {
  text: string;
  variant?: VariantProps<typeof badgeVariants>['variant'];
  className?: string;
};

/**
 * A Badge that clamps to its parent's width and only opens a Tooltip when
 * the text is actually truncated. Renders the badge styling on a single
 * span we own the ref to, so the Radix Tooltip trigger and the truncation
 * measurement target the same DOM node. The Tooltip wrapper is always
 * mounted — only `TooltipContent` is gated — so the span never remounts
 * when truncation state flips, and the `ResizeObserver` keeps firing.
 */
export function TruncatedTag({ text, variant = 'secondary', className }: TruncatedTagProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setIsTruncated(el.scrollWidth > el.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    <Tooltip>
      <TooltipTrigger asChild={true}>
        <span ref={ref} className={cn(badgeVariants({ variant }), 'block max-w-full truncate', className)}>
          {text}
        </span>
      </TooltipTrigger>
      {isTruncated && <TooltipContent className="max-w-sm break-words">{text}</TooltipContent>}
    </Tooltip>
  );
}
