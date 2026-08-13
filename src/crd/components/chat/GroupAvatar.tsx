import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { AVATAR_SIZE_CLASS, type AvatarSize } from './avatarSizes';
import { initials } from './initials';
import type { ChatMemberAvatar } from './types';

type GroupAvatarProps = {
  members: ChatMemberAvatar[];
  size?: AvatarSize;
  className?: string;
};

/**
 * Composite avatar for a conversation: a single avatar for 1 member, or a 2×2
 * grid of up to 4 member avatars for a group. Always decorative (`aria-hidden`) —
 * the group name is the adjacent accessible text wherever it renders.
 */
export function GroupAvatar({ members, size = 'md', className }: GroupAvatarProps) {
  const shown = members.slice(0, 4);

  if (shown.length <= 1) {
    const member = shown[0];
    return (
      <Avatar aria-hidden="true" className={cn(AVATAR_SIZE_CLASS[size], className)}>
        {member?.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
        <AvatarFallback className="text-caption">{member ? initials(member.name) : '?'}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div
      className={cn(
        'grid shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-full',
        AVATAR_SIZE_CLASS[size],
        className
      )}
      aria-hidden="true"
    >
      {shown.map(member => (
        <Avatar key={member.id} className="size-full rounded-none">
          {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
          <AvatarFallback className="rounded-none text-badge">{initials(member.name)}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
