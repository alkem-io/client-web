import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type * as React from 'react';

import { cn } from '@/crd/lib/utils';
import { backgroundGradient } from '../lib/backgroundGradient';

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image data-slot="avatar-image" className={cn('aspect-square size-full', className)} {...props} />
  );
}

function AvatarFallback({ className, color, style, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  const background = color ? backgroundGradient(color) : undefined;
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('flex size-full items-center justify-center rounded-full', !background && 'bg-muted', className)}
      {...props}
      style={{ ...style, ...background }}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
