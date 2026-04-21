import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

export type UserResultCardData = {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  email?: string;
  href: string;
};

type UserResultCardProps = {
  user: UserResultCardData;
  onClick: () => void;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

export function UserResultCard({ user, onClick }: UserResultCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={user.name}
      className={cn(
        'group block w-full rounded-xl border bg-card overflow-hidden',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'shadow-none hover:shadow-[var(--elevation-sm)] hover:border-primary/30',
        'transition-all duration-300 cursor-pointer'
      )}
    >
      {/* Content */}
      <div className="p-5 flex flex-col items-center text-center">
        {/* Avatar */}
        <Avatar className="size-14 border-2 border-border mb-3">
          <AvatarImage src={user.avatarUrl} alt="" />
          <AvatarFallback className="bg-primary text-primary-foreground text-subsection-title">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <h4 className="text-card-title text-card-foreground group-hover:text-primary transition-colors duration-200">
          {user.name}
        </h4>

        {/* Role */}
        {user.role && <p className="mt-1 text-caption text-muted-foreground truncate w-full">{user.role}</p>}

        {/* Email */}
        {user.email && <p className="mt-0.5 text-caption text-muted-foreground truncate w-full">{user.email}</p>}
      </div>
    </button>
  );
}
