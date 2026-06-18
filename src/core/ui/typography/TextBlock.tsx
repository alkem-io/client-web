import type { ComponentPropsWithoutRef, Ref } from 'react';
import { cn } from '@/crd/lib/utils';

type TextBlockProps = ComponentPropsWithoutRef<'div'> & {
  ref?: Ref<HTMLDivElement>;
};

// gap = GUTTER_PX / 2 = 10px → Tailwind gap-2.5
const TextBlock = ({ ref, className, ...props }: TextBlockProps) => (
  <div ref={ref} className={cn('flex flex-col gap-2.5', className)} {...props} />
);

export default TextBlock;
