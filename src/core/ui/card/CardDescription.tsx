import type { CSSProperties, ReactNode } from 'react';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { GUTTER_MUI } from '../grid/gutter.constants';
import stopPropagationFromLinks from '../utils/stopPropagationFromLinks';

// One layout gutter equals MUI `theme.spacing(GUTTER_MUI)` (8px base spacing).
const GUTTER_HEIGHT_PX = GUTTER_MUI * 8;

export const DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS = 4;

export interface CardDescriptionProps {
  children: string | undefined;
  // Kept for API compatibility; the fade now always blends to the card surface.
  overflowGradientColor?: string;
  heightGutters?: number;
  className?: string;
  style?: CSSProperties;
  flexGrow?: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  endAdornment?: ReactNode;
}

export const CardDescription = ({
  children,
  heightGutters = DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS,
  className,
  style,
  flexGrow,
  onClick,
}: CardDescriptionProps) => {
  const maxHeight = `${heightGutters * GUTTER_HEIGHT_PX}px`;

  return (
    <div
      className={cn('px-3 py-2', className)}
      style={{ ...(flexGrow !== undefined && { flexGrow }), ...style }}
      onClick={onClick ?? stopPropagationFromLinks}
    >
      {/* Overflow fade: clip to a fixed height and blend the bottom edge into
          the card surface, mirroring the old OverflowGradient bottom gradient. */}
      <div
        className="relative overflow-hidden"
        style={{
          maxHeight,
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
        }}
      >
        <MarkdownContent content={children ?? ''} />
      </div>
    </div>
  );
};

export default CardDescription;
