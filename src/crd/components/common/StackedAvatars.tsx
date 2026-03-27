import { cn } from '@/crd/lib/utils';

export type StackedAvatarItem = {
  initials: string;
  avatarUrl?: string;
  avatarColor: string;
  name?: string;
};

type StackedAvatarsProps = {
  primary: StackedAvatarItem;
  secondary?: StackedAvatarItem;
  className?: string;
};

export function StackedAvatars({ primary, secondary, className }: StackedAvatarsProps) {
  if (secondary) {
    return (
      <div className={cn('relative size-11', className)}>
        {/* Secondary avatar (behind) */}
        <div
          className="absolute top-0 left-0 size-8 overflow-hidden flex items-center justify-center rounded-lg border-2 border-card z-[1]"
          style={{ background: secondary.avatarColor }}
        >
          {secondary.avatarUrl ? (
            <img src={secondary.avatarUrl} alt={secondary.name ?? ''} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[9px] font-bold text-primary-foreground">{secondary.initials}</span>
          )}
        </div>
        {/* Primary avatar (in front) */}
        <div
          className="absolute bottom-0 right-0 size-[34px] overflow-hidden flex items-center justify-center rounded-lg border-[2.5px] border-card z-[2] shadow-[var(--elevation-sm)]"
          style={{ background: primary.avatarColor }}
        >
          {primary.avatarUrl ? (
            <img src={primary.avatarUrl} alt={primary.name ?? ''} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold text-primary-foreground">{primary.initials}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'size-10 overflow-hidden flex items-center justify-center rounded-lg border-[2.5px] border-card shadow-[var(--elevation-sm)]',
        className
      )}
      style={{ background: primary.avatarColor }}
    >
      {primary.avatarUrl ? (
        <img src={primary.avatarUrl} alt={primary.name ?? ''} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-primary-foreground">{primary.initials}</span>
      )}
    </div>
  );
}
