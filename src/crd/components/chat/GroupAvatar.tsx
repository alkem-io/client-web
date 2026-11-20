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

const TILE_CLASS = {
  left: 'inset-y-0 left-0 h-full w-1/2',
  right: 'inset-y-0 right-0 h-full w-1/2',
  'top-left': 'left-0 top-0 size-1/2',
  'top-right': 'right-0 top-0 size-1/2',
  'bottom-left': 'bottom-0 left-0 size-1/2',
  'bottom-right': 'bottom-0 right-0 size-1/2',
} as const;

type Tile = keyof typeof TILE_CLASS;

/** Where each face goes, by how many faces there are. From five on, the last quarter holds the count. */
const LAYOUT: Record<2 | 3 | 4, Tile[]> = {
  2: ['left', 'right'],
  3: ['left', 'top-right', 'bottom-right'],
  4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
};

/**
 * Composite avatar for a conversation. One member fills the circle; a group
 * divides the whole circle by how many faces there are: halves for 2, a half and
 * two quarters for 3, quarters for 4, and from 5 on three faces plus a "+N"
 * quarter for the rest. Always decorative (`aria-hidden`) — the group name is
 * the adjacent accessible text wherever it renders.
 */
export function GroupAvatar({ members, size = 'md', className }: GroupAvatarProps) {
  if (members.length <= 1) {
    const member = members[0];
    return (
      <Avatar aria-hidden="true" className={cn(AVATAR_SIZE_CLASS[size], className)}>
        {member?.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
        <AvatarFallback className="text-caption">{member ? initials(member.name) : '?'}</AvatarFallback>
      </Avatar>
    );
  }

  const withCount = members.length > 4;
  const shown = withCount ? members.slice(0, 3) : members;
  const tiles = LAYOUT[withCount ? 4 : (members.length as 2 | 3 | 4)];

  return (
    <div
      className={cn('relative shrink-0 overflow-hidden rounded-full', AVATAR_SIZE_CLASS[size], className)}
      aria-hidden="true"
    >
      {shown.map((member, index) => (
        <Avatar
          key={member.id}
          data-tile={tiles[index]}
          className={cn('absolute rounded-none', TILE_CLASS[tiles[index]])}
        >
          {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" className="object-cover" />}
          <AvatarFallback className="rounded-none text-badge">{initials(member.name)}</AvatarFallback>
        </Avatar>
      ))}
      {withCount && (
        <span
          data-tile="bottom-right"
          className={cn(
            'absolute flex items-center justify-center bg-muted text-badge text-muted-foreground tabular-nums',
            TILE_CLASS['bottom-right']
          )}
        >
          +{members.length - 3}
        </span>
      )}
    </div>
  );
}
