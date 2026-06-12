import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import type { ChatMemberAvatar } from './types';

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('') || '?';

const SIZE_CLASS = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
} as const;

type GroupAvatarProps = {
  members: ChatMemberAvatar[];
  size?: keyof typeof SIZE_CLASS;
  className?: string;
};

/**
 * Composite avatar for a conversation: a single avatar for 1 member, or a 2×2
 * grid of up to 4 member avatars for a group.
 */
export function GroupAvatar({ members, size = 'md', className }: GroupAvatarProps) {
  const shown = members.slice(0, 4);

  if (shown.length <= 1) {
    const member = shown[0];
    return (
      <Avatar className={cn(SIZE_CLASS[size], className)}>
        {member?.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
        <AvatarFallback className="text-caption">{member ? initials(member.name) : '?'}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div
      className={cn('grid shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-full', SIZE_CLASS[size], className)}
      aria-hidden="true"
    >
      {shown.map(member => (
        <Avatar key={member.id} className="size-full rounded-none">
          {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
          <AvatarFallback className="rounded-none text-[8px]">{initials(member.name)}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
