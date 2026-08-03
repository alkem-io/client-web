import type { ComponentPropsWithoutRef, ReactNode } from 'react';

// Shared test double for the Radix-based avatar primitives: Radix only mounts
// AvatarPrimitive.Image once the browser reports the image as loaded, which
// never happens in jsdom. Tests activate it with `vi.mock('@/crd/primitives/avatar')`
// (no factory) so the props components pass down stay observable.
export const Avatar = ({
  children,
  className,
  ...rest
}: { children?: ReactNode } & ComponentPropsWithoutRef<'div'>) => (
  <div className={className} data-testid="avatar" {...rest}>
    {children}
  </div>
);

export const AvatarImage = ({ src, alt, className }: { src?: string; alt?: string; className?: string }) => (
  <img src={src} alt={alt} className={className} data-testid="avatar-image" />
);

export const AvatarFallback = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <span className={className} data-testid="avatar-fallback">
    {children}
  </span>
);
