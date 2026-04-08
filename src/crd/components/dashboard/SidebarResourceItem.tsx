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
  className?: string;
};

export function SidebarResourceItem({
  name,
  href,
  avatarUrl,
  initials,
  avatarColor,
  className,
}: SidebarResourceItemProps) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className
      )}
    >
      <Avatar className="size-6">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="text-[10px]" style={avatarColor ? { backgroundColor: avatarColor } : undefined}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-sm">{name}</span>
    </a>
  );
}
