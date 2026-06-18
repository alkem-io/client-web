import type { PropsWithChildren } from 'react';
import { Caption } from '@/core/ui/typography';
import { cn } from '@/crd/lib/utils';

type CharacterCounterProps = {
  count?: number;
  separator?: string;
  maxLength?: number;
  disabled?: boolean;
  flexWrap?: 'wrap' | 'nowrap';
};

const getText = (count: number, separator: string, maxLength?: number) =>
  [count, maxLength].filter(num => typeof num !== 'undefined').join(separator);

export const CharacterCounter = ({
  count = 0,
  separator = ' / ',
  disabled = false,
  maxLength,
  flexWrap,
  children,
}: PropsWithChildren<CharacterCounterProps>) => {
  const isOverLimit = Boolean(maxLength && count > maxLength);
  const isHidden = !maxLength || maxLength - count > 10;

  return (
    <div
      className={cn(
        'flex items-start gap-4 gap-y-0',
        children ? 'justify-between' : 'justify-end',
        flexWrap === 'wrap' && 'flex-wrap',
        flexWrap === 'nowrap' && 'flex-nowrap'
      )}
    >
      {children}
      {!disabled && (
        <Caption
          className={isOverLimit ? 'text-destructive' : undefined}
          sx={{ visibility: isHidden ? 'hidden' : 'visible' }}
        >
          {getText(count, separator, maxLength)}
        </Caption>
      )}
    </div>
  );
};

export default CharacterCounter;
