import { Bot } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { GroupAvatar } from './GroupAvatar';
import { initials } from './initials';
import type { ChatMemberAvatar } from './types';

const SIZE_CLASS = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
} as const;

const ICON_SIZE_CLASS = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
} as const;

export type ConversationAvatarProps = {
  displayName: string;
  avatarUrl?: string;
  isGroup: boolean;
  isGuidance: boolean;
  memberAvatars?: ChatMemberAvatar[];
  size?: keyof typeof SIZE_CLASS;
  className?: string;
};

/**
 * Shared conversation-identity branch: the Guidance bot circle, a group's
 * custom photo or 4-avatar composite, or a single 1:1 avatar. Used by both
 * the conversation list rows and the thread header, so the two surfaces can
 * never disagree (research D2/D4).
 */
export function ConversationAvatar({
  displayName,
  avatarUrl,
  isGroup,
  isGuidance,
  memberAvatars,
  size = 'md',
  className,
}: ConversationAvatarProps) {
  if (isGuidance) {
    return (
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary',
          SIZE_CLASS[size],
          className
        )}
      >
        <Bot aria-hidden="true" className={ICON_SIZE_CLASS[size]} />
      </span>
    );
  }

  if (isGroup && !avatarUrl) {
    return <GroupAvatar members={memberAvatars ?? []} size={size} className={className} />;
  }

  return (
    <Avatar className={cn(SIZE_CLASS[size], 'shrink-0', className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback className="text-caption">{initials(displayName)}</AvatarFallback>
    </Avatar>
  );
}
