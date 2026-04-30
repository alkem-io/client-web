import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

export type SidebarResourceData = {
  id: string;
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor?: string;
};

type SidebarResourceItemProps = SidebarResourceData & {
  /** Render the avatar as a rounded square instead of a circle. Used by the
   * My Spaces section to match the squared subspace avatars in the space sidebar. */
  square?: boolean;
  className?: string;
};

export function SidebarResourceItem({
  name,
  href,
  avatarUrl,
  initials,
  avatarColor,
  square,
  className,
}: SidebarResourceItemProps) {
  const shapeClass = square ? 'rounded-md' : undefined;
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className
      )}
    >
      <Avatar className={cn('size-6', shapeClass)}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback
          className={cn('text-badge', shapeClass)}
          style={avatarColor ? { backgroundColor: avatarColor } : undefined}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-body">{name}</span>
    </a>
  );
}
