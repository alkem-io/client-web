import { Bot } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { AVATAR_SIZE_CLASS, type AvatarSize } from './avatarSizes';
import { GroupAvatar } from './GroupAvatar';
import { initials } from './initials';
import type { ChatMemberAvatar } from './types';

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
  size?: AvatarSize;
  className?: string;
};

/**
 * Shared conversation-identity branch: the Guidance bot circle, a group's
 * custom photo or 4-avatar composite, or a single 1:1 avatar. Used by both
 * the conversation list rows and the thread header, so the two surfaces can
 * never disagree (research D2/D4).
 *
 * Always decorative (`aria-hidden`): the conversation title/display name is the
 * adjacent accessible text on every surface, so exposing the avatar (notably the
 * initials fallback) would only duplicate it for assistive technology.
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
        aria-hidden="true"
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary',
          AVATAR_SIZE_CLASS[size],
          className
        )}
      >
        <Bot className={ICON_SIZE_CLASS[size]} />
      </span>
    );
  }

  if (isGroup && !avatarUrl) {
    return <GroupAvatar members={memberAvatars ?? []} size={size} className={className} />;
  }

  return (
    <Avatar aria-hidden="true" className={cn(AVATAR_SIZE_CLASS[size], 'shrink-0', className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback className="text-caption">{initials(displayName)}</AvatarFallback>
    </Avatar>
  );
}
