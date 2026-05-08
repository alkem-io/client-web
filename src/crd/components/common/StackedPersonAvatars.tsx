import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

export type StackedPerson = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type StackedPersonAvatarsProps = {
  people: StackedPerson[];
  /** Maximum number of avatars to render before collapsing the rest into a `+N` tile. */
  maxVisible?: number;
  /** Additional classes for the outer flex container. */
  className?: string;
  /** Pre-localized aria-label for the whole group (e.g., "5 voters"). Pass via the consumer's `t()` so the component stays free of i18n. */
  groupAriaLabel?: string;
  /**
   * Pre-localized tooltip body for the `+N` overflow tile (e.g., "and 3 more").
   * The component renders `+{remaining}` in the tile itself; this prop only
   * controls the tooltip body. When omitted the tooltip is suppressed.
   */
  overflowTooltipLabel?: string;
  /**
   * Avatar size — Tailwind `size-*` token without the `size-` prefix.
   * Defaults to `5` (20px) which fits both the poll-results row and a
   * card-footer "Led by:" row.
   */
  sizeClass?: string;
};

/**
 * Reusable stacked-person-avatars row. Used by:
 * - `CalloutPoll` (poll results — voters of a given option)
 * - `UserMembershipTabView` (membership card footer — "Led by:" leads of a space)
 * - any future consumer that needs a compact "who" indicator
 *
 * The component is intentionally pure presentational: it receives plain
 * `{id, name, avatarUrl}[]` and pre-localized labels as props, never calls
 * `useTranslation` itself, so consumers from any i18n namespace can share it
 * without the component depending on a specific feature namespace.
 *
 * Visual behaviour:
 * - Avatars overlap with `-space-x-2` (matches the prototype look).
 * - Hovering the row spreads the avatars apart slightly (`hover:space-x-1`)
 *   for a nicer reveal — kept from the original `PollVoterAvatars`.
 * - Each avatar carries a tooltip with the person's `name`.
 * - When `people.length > maxVisible`, the remaining count collapses into a
 *   `+N` tile with the consumer-provided `overflowTooltipLabel` body.
 */
export function StackedPersonAvatars({
  people,
  maxVisible = 10,
  className,
  groupAriaLabel,
  overflowTooltipLabel,
  sizeClass = '5',
}: StackedPersonAvatarsProps) {
  if (people.length === 0) return null;

  const visible = people.slice(0, maxVisible);
  const remaining = people.length - maxVisible;
  const sizeClasses = `size-${sizeClass}`;

  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" is the correct semantic for a related-avatars cluster
    <div
      role="group"
      className={cn(
        'flex items-center justify-end -space-x-2 hover:space-x-1 [&>*]:transition-[margin] [&>*]:duration-300',
        className
      )}
      aria-label={groupAriaLabel}
    >
      {visible.map(person => (
        <Tooltip key={person.id}>
          <TooltipTrigger asChild={true}>
            <Avatar className={cn('cursor-default border border-background', sizeClasses)}>
              {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt={person.name} /> : null}
              <AvatarFallback className="text-badge">{person.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{person.name}</TooltipContent>
        </Tooltip>
      ))}
      {remaining > 0 ? (
        overflowTooltipLabel ? (
          <Tooltip>
            <TooltipTrigger asChild={true}>
              <span
                className={cn(
                  'flex shrink-0 cursor-default items-center justify-center rounded-full border border-background bg-muted text-badge text-muted-foreground !ml-[5px]',
                  sizeClasses
                )}
              >
                +{remaining}
              </span>
            </TooltipTrigger>
            <TooltipContent>{overflowTooltipLabel}</TooltipContent>
          </Tooltip>
        ) : (
          <span
            className={cn(
              'flex shrink-0 cursor-default items-center justify-center rounded-full border border-background bg-muted text-badge text-muted-foreground !ml-[5px]',
              sizeClasses
            )}
          >
            +{remaining}
          </span>
        )
      ) : null}
    </div>
  );
}
