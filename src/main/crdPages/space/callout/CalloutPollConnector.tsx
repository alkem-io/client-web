import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, PollResultsDetail, PollStatus } from '@/core/apollo/generated/graphql-schema';
import type { PollOptionData, PollVoterData } from '@/crd/components/callout/CalloutPoll';
import { CalloutPoll } from '@/crd/components/callout/CalloutPoll';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { MAX_POLL_OPTIONS } from '@/crd/forms/callout/PollOptionsEditor';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { usePollOptionManagement } from '@/domain/collaboration/poll/hooks/usePollOptionManagement';
import { usePollSubscriptions } from '@/domain/collaboration/poll/hooks/usePollSubscriptions';
import { usePollVote } from '@/domain/collaboration/poll/hooks/usePollVote';
import type { PollDetailsModel } from '@/domain/collaboration/poll/models/PollModels';

const CHECKBOX_DEBOUNCE_MS = 2_000;

const useDebouncedSubmit = (delayMs: number) => {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [debounceProgress, setDebounceProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsDebouncing(false);
    setDebounceProgress(0);
  };

  const schedule = (callback: () => void) => {
    cancel();
    setIsDebouncing(true);
    setDebounceProgress(0);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsDebouncing(false);
      callback();
    }, delayMs);
    intervalRef.current = setInterval(() => {
      if (timerRef.current === null && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }
      setDebounceProgress(prev => Math.min(100, prev + (50 / delayMs) * 100));
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { isDebouncing, debounceProgress, schedule, cancel };
};

function mapResultsDetail(detail: PollResultsDetail): 'full' | 'count' | 'percentage' {
  switch (detail) {
    case PollResultsDetail.Full:
      return 'full';
    case PollResultsDetail.Count:
      return 'count';
    case PollResultsDetail.Percentage:
      return 'percentage';
    default:
      return 'count';
  }
}

function mapOptions(poll: PollDetailsModel, selectedOptionIds: string[]): PollOptionData[] {
  return poll.options.map(option => ({
    id: option.id,
    text: option.text,
    sortOrder: option.sortOrder,
    voteCount: option.voteCount,
    votePercentage: option.votePercentage,
    isSelected: selectedOptionIds.includes(option.id),
    voters: option.voters?.map(
      (v): PollVoterData => ({
        id: v.id,
        name: v.profile?.displayName ?? '',
        avatarUrl: v.profile?.visual?.uri,
      })
    ),
  }));
}

type CalloutPollConnectorProps = {
  callout: CalloutDetailsModelExtended;
};

export function CalloutPollConnector({ callout }: CalloutPollConnectorProps) {
  const poll = callout.framing.poll;

  usePollSubscriptions({ pollId: poll?.id });

  if (!poll) return null;

  return <CalloutPollConnectorInner callout={callout} poll={poll} />;
}

function CalloutPollConnectorInner({
  callout,
  poll,
}: {
  callout: CalloutDetailsModelExtended;
  poll: PollDetailsModel;
}) {
  const { t } = useTranslation('crd-space');

  const canVote = callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Contribute) ?? false;
  const mySelectedOptionIds = poll.myVote?.selectedOptions.map(o => o.id) ?? [];
  const hasVoted = !!poll.myVote;
  const isClosed = poll.status === PollStatus.Closed;
  const isAnonymous = poll.settings.resultsDetail !== PollResultsDetail.Full;
  const isSingleChoice = poll.settings.maxResponses === 1;

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(mySelectedOptionIds);
  const selectedOptionIdsRef = useRef(selectedOptionIds);
  selectedOptionIdsRef.current = selectedOptionIds;
  const [voteRevoked, setVoteRevoked] = useState(false);
  const [addingOptionStatus, setAddingOptionStatus] = useState<'idle' | 'adding' | 'voting'>('idle');
  const hadVotedRef = useRef(hasVoted);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const {
    isDebouncing,
    debounceProgress,
    schedule: scheduleDebounce,
    cancel: cancelDebounce,
  } = useDebouncedSubmit(CHECKBOX_DEBOUNCE_MS);

  // Sync local selection with server state
  useEffect(() => {
    const serverIds = poll.myVote?.selectedOptions.map(o => o.id) ?? [];
    setSelectedOptionIds(serverIds);
  }, [poll.myVote]);

  // Handle subscription-driven vote revocation
  useEffect(() => {
    if (hadVotedRef.current && !hasVoted) {
      cancelDebounce();
      setSelectedOptionIds([]);
      setVoteRevoked(true);
    }
    hadVotedRef.current = hasVoted;
  }, [hasVoted]);

  // Remove selections for deleted options
  useEffect(() => {
    const currentOptionIds = new Set(poll.options.map(o => o.id));
    setSelectedOptionIds(prev => {
      const filtered = prev.filter(id => currentOptionIds.has(id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [poll.options]);

  const {
    castVote,
    removeVote,
    voteRemoved,
    loading: voteLoading,
    error: voteError,
  } = usePollVote({ pollId: poll.id, poll });
  const { addOption } = usePollOptionManagement({ pollId: poll.id });

  const showResults = poll.canSeeDetailedResults;
  const showTotalOnly = !poll.canSeeDetailedResults && poll.totalVotes != null;
  const showAddCustomOption =
    poll.settings.allowContributorsAddOptions && canVote && !isClosed && poll.options.length < MAX_POLL_OPTIONS;

  const loading = voteLoading || addingOptionStatus !== 'idle';

  const submitVote = (optionIds: string[]) => {
    if (optionIds.length < poll.settings.minResponses) return;
    castVote(optionIds);
    setVoteRevoked(false);
  };

  const handleChange = (newSelectedIds: string[]) => {
    if (!canVote || isClosed) return;

    setSelectedOptionIds(newSelectedIds);
    cancelDebounce();

    if (isSingleChoice) {
      submitVote(newSelectedIds);
    } else {
      if (
        newSelectedIds.length >= poll.settings.minResponses &&
        (poll.settings.maxResponses === 0 || newSelectedIds.length <= poll.settings.maxResponses)
      ) {
        scheduleDebounce(() => submitVote(newSelectedIds));
      } else {
        scheduleDebounce(() => removeVote());
      }
    }
  };

  const handleSubmitCustomOption = async (text: string) => {
    if (!canVote || isClosed) return;

    cancelDebounce();
    setAddingOptionStatus('adding');
    try {
      const result = await addOption(text);
      const updatedPoll = result.data?.addPollOption;
      if (!updatedPoll) return;

      const currentOptionIds = new Set(poll.options.map(o => o.id));
      const newOption = updatedPoll.options.find(o => !currentOptionIds.has(o.id));
      if (!newOption) return;

      setAddingOptionStatus('voting');

      const voteOptionIds = isSingleChoice ? [newOption.id] : [...selectedOptionIdsRef.current, newOption.id];
      await castVote(voteOptionIds);
      setVoteRevoked(false);
    } finally {
      setAddingOptionStatus('idle');
    }
  };

  const statusMessage =
    addingOptionStatus === 'adding'
      ? t('poll.status.addingOption')
      : addingOptionStatus === 'voting'
        ? t('poll.status.submitting')
        : voteLoading
          ? t('poll.status.submitting')
          : isDebouncing
            ? t('poll.status.preparingVote')
            : undefined;

  const warningMessage = voteRevoked && !hasVoted && !voteRemoved ? t('poll.subscription.voteRevoked') : undefined;

  const errorMessage = voteError ? t('poll.error.voteFailed') : undefined;

  return (
    <>
      <CalloutPoll
        title={poll.title}
        options={mapOptions(poll, selectedOptionIds)}
        selectedOptionIds={selectedOptionIds}
        isSingleChoice={isSingleChoice}
        isClosed={isClosed}
        canVote={canVote}
        showResults={showResults}
        showTotalOnly={showTotalOnly}
        resultsDetail={mapResultsDetail(poll.settings.resultsDetail)}
        totalVotes={poll.totalVotes}
        hasVoted={hasVoted}
        isAnonymous={isAnonymous}
        showAddCustomOption={showAddCustomOption}
        isAddingCustomOption={addingOptionStatus !== 'idle'}
        onSubmitCustomOption={handleSubmitCustomOption}
        onChange={handleChange}
        onRemoveVote={() => setConfirmRemoveOpen(true)}
        statusMessage={statusMessage}
        statusProgress={isDebouncing ? debounceProgress : undefined}
        errorMessage={errorMessage}
        warningMessage={warningMessage}
      />
      <ConfirmationDialog
        open={confirmRemoveOpen}
        onOpenChange={setConfirmRemoveOpen}
        title={t('poll.removeVoteConfirm.title')}
        description={t('poll.removeVoteConfirm.description')}
        confirmLabel={t('poll.removeVoteConfirm.confirm')}
        onConfirm={() => {
          removeVote();
          setConfirmRemoveOpen(false);
        }}
        loading={loading}
      />
    </>
  );
}
