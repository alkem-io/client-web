import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

type Voter = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type PollVoterAvatarsProps = {
  voters: Voter[];
  maxVisible?: number;
  className?: string;
};

export function PollVoterAvatars({ voters, maxVisible = 10, className }: PollVoterAvatarsProps) {
  const { t } = useTranslation('crd-space');

  if (voters.length === 0) return null;

  const visibleVoters = voters.slice(0, maxVisible);
  const remaining = voters.length - maxVisible;

  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" is the correct semantic for a set of related avatars
    <div
      role="group"
      className={cn(
        'flex items-center justify-end -space-x-2 hover:space-x-1 [&>*]:transition-[margin] [&>*]:duration-300',
        className
      )}
      aria-label={t('poll.results.totalVotes', { count: voters.length })}
    >
      {visibleVoters.map(voter => (
        <Tooltip key={voter.id}>
          <TooltipTrigger asChild={true}>
            <Avatar className="size-5 border border-background cursor-default">
              {voter.avatarUrl && <AvatarImage src={voter.avatarUrl} alt={voter.name} />}
              <AvatarFallback className="text-badge">{voter.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{voter.name}</TooltipContent>
        </Tooltip>
      ))}
      {remaining > 0 && (
        <Tooltip>
          <TooltipTrigger asChild={true}>
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-badge text-muted-foreground border border-background cursor-default !ml-[5px]">
              +{remaining}
            </span>
          </TooltipTrigger>
          <TooltipContent>{t('poll.results.votersMore', { count: remaining })}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
