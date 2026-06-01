import { HelpOutlineOutlined } from '@mui/icons-material';
import {
  Box,
  IconButton,
  type InputBaseComponentProps,
  Paper,
  Popper,
  type PopperProps,
  styled,
  Tooltip,
} from '@mui/material';
import type React from 'react';
import { type PropsWithChildren, type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mention, MentionsInput, type OnChangeHandlerFunc, type SuggestionDataItem } from 'react-mentions';
import {
  useForumMentionableContributorsLazyQuery,
  useMentionableContributorsLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { ProfileChipView } from '@/domain/community/contributor/ProfileChip/ProfileChipView';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';

export const POPPER_Z_INDEX = 1400; // Dialogs are 1300
const MAX_USERS_LISTED = 30;

export const MENTION_SYMBOL = '@';
const MENTION_INVALID_CHARS_REGEXP = /[?]/; // skip mentions if any of these are used after MENTION_SYMBOL
const MAX_SPACES_IN_MENTION = 2;
const MAX_MENTION_LENGTH = 30;
const MENTION_DEBOUNCE_MS = 300;

interface EnrichedSuggestionDataItem extends SuggestionDataItem {
  // `id` and `display` are from SuggestionDataItem and used by react-mentions
  // `id` must contain the type of mentioned contributor (user/organization/vc)
  id: string;
  display: string;
  avatarUrl: string | undefined;
  city?: string;
  country?: string;
  virtualContributor?: boolean;
}

const SuggestionsVCDisclaimer = () => {
  const { t } = useTranslation();
  return (
    <Gutters
      row={true}
      height={gutters(2)}
      alignItems="center"
      justifyContent="space-between"
      fontSize="small"
      fontStyle="italic"
      paddingX={gutters(0.5)}
    >
      {t('components.post-comment.vcInteractions.disclaimer')}
      <Tooltip
        title={<Caption>{t('components.post-comment.vcInteractions.help')}</Caption>}
        placement="top"
        arrow={true}
      >
        <IconButton size="small" aria-label={t('components.post-comment.vcInteractions.help')}>
          <HelpOutlineOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </Gutters>
  );
};

/**
 * Rounded paper that pops under the input field showing the mentions
 */
type SuggestionsContainerProps = {
  anchorElement: PopperProps['anchorEl'];
  disclaimer?: ReactNode;
};

const SuggestionsContainer = ({
  anchorElement,
  children,
  disclaimer = null,
}: PropsWithChildren<SuggestionsContainerProps>) => {
  return (
    <Popper open={true} placement="bottom-start" anchorEl={anchorElement} sx={{ zIndex: POPPER_Z_INDEX }}>
      <Paper elevation={3}>
        <Box
          sx={theme => ({
            width: gutters(17)(theme),
            maxHeight: gutters(20)(theme),
            overflowY: 'auto',
            '& li': {
              listStyle: 'none',
              margin: 0,
              padding: 0,
            },
            '& li:hover': {
              background: theme.palette.highlight.light,
            },
          })}
        >
          {disclaimer}
          {children}
        </Box>
      </Paper>
    </Popper>
  );
};

/**
 * CommentInput
 * Wrapper around MentionsInput to style it properly and to query for users on mentions
 */
export interface CommentInputFieldProps {
  value: string;
  onValueChange?: (newValue: string) => void;
  onBlur?: () => void;
  inactive?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  onReturnKey?: (event: React.KeyboardEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLInputElement>) => void;
  popperAnchor: SuggestionsContainerProps['anchorElement'];
  vcInteractions?: { threadID: string }[];
  vcEnabled?: boolean;
  threadId?: string;
  'aria-label'?: string;
  placeholder?: string;
  mentionsEnabled?: boolean;
}

const StyledCommentInput = styled(Box)(({ theme }) => ({
  flex: 1,
  '& textarea': {
    // TODO: Maybe this should be somewhere else
    // Align the textarea contents and override default react-mentions styles
    lineHeight: '20px',
    top: '-1px !important',
    left: '-1px !important',
    border: 'none !important',
    outline: 'none',
  },
  '& textarea:focus': {
    outline: 'none',
  },
  '& strong': {
    color: theme.palette.common.black,
  },
}));

const hasExcessiveSpaces = (searchTerm: string) => searchTerm.trim().split(' ').length > MAX_SPACES_IN_MENTION + 1;

export const CommentInputField = ({ ref, ...props }: React.ComponentPropsWithRef<'div'> & InputBaseComponentProps) => {
  const {
    value,
    onValueChange,
    onBlur,
    inactive,
    readOnly,
    maxLength,
    onReturnKey,
    popperAnchor,
    vcInteractions = [],
    vcEnabled = true,
    threadId,
    'aria-label': ariaLabel,
    placeholder,
    mentionsEnabled = true,
  } = props as CommentInputFieldProps;

  const { t } = useTranslation();
  const containerRef = useCombinedRefs(null, ref);

  const currentMentionedUsersRef = useRef<SuggestionDataItem[]>([]);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const emptyQueries = useRef<string[]>([]).current;

  const [querySpaceUsers] = useMentionableContributorsLazyQuery();
  const [queryForumUsers] = useForumMentionableContributorsLazyQuery();

  const { space } = useSpace();
  const { subspace } = useSubSpace();
  const spaceID = subspace.id || space.id;

  const isAlreadyMentioned = ({ profile }: { profile?: { url: string } }) =>
    currentMentionedUsersRef.current.some(mention => mention.id === profile?.url);

  const hasVcInteraction = vcInteractions.some(interaction => interaction?.threadID === threadId);

  const getMentionableContributors = async (search: string): Promise<EnrichedSuggestionDataItem[]> => {
    if (
      !search ||
      emptyQueries.some(query => search.startsWith(query)) ||
      hasExcessiveSpaces(search) ||
      MENTION_INVALID_CHARS_REGEXP.test(search) ||
      search.length > MAX_MENTION_LENGTH
    ) {
      return [];
    }

    // Outside any Space (e.g. the platform Forum) there is no Space ID; fall
    // back to the platform-wide Forum-level mentionable contributors query.
    const contributors = spaceID
      ? (
          await querySpaceUsers({
            variables: { spaceID, filter: { displayName: search }, limit: MAX_USERS_LISTED },
          })
        ).data?.lookup?.space?.mentionableContributors
      : (
          await queryForumUsers({
            variables: { filter: { displayName: search }, limit: MAX_USERS_LISTED },
          })
        ).data?.platform?.forum?.mentionableContributors;

    const mentionableContributors: EnrichedSuggestionDataItem[] = [];
    const suppressVcs = hasVcInteraction || !vcEnabled;

    contributors?.forEach(contributor => {
      if (isAlreadyMentioned(contributor)) return;
      if (!contributor.profile?.url || !contributor.profile.displayName) return;
      const isVc = contributor.type === ActorType.VirtualContributor;
      if (isVc && suppressVcs) return;
      mentionableContributors.push({
        id: contributor.profile.url,
        display: contributor.profile.displayName,
        avatarUrl: contributor.profile.avatar?.uri,
        ...(isVc
          ? { virtualContributor: true }
          : {
              city: contributor.profile.location?.city,
              country: contributor.profile.location?.country,
            }),
      });
    });

    if (!mentionableContributors.length) {
      emptyQueries.push(search);
    }

    return mentionableContributors;
  };

  const mentionDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mentionPendingCallbacksRef = useRef<Array<(users: EnrichedSuggestionDataItem[]) => void>>([]);

  useEffect(
    () => () => {
      if (mentionDebounceTimerRef.current) {
        clearTimeout(mentionDebounceTimerRef.current);
      }
    },
    []
  );

  const findMentionableContributors = (search: string, callback: (users: EnrichedSuggestionDataItem[]) => void) => {
    mentionPendingCallbacksRef.current.push(callback);
    if (mentionDebounceTimerRef.current) {
      clearTimeout(mentionDebounceTimerRef.current);
    }
    mentionDebounceTimerRef.current = setTimeout(async () => {
      mentionDebounceTimerRef.current = null;
      const callbacks = mentionPendingCallbacksRef.current.splice(0);
      let users: EnrichedSuggestionDataItem[] = [];
      try {
        users = await getMentionableContributors(search);
      } catch {
        users = [];
      }
      for (const cb of callbacks) {
        cb(users);
      }
    }, MENTION_DEBOUNCE_MS);
  };

  // Open a tooltip (which is the same Popper that contains the matching users) but with a helper message
  // that says something like "Start typing to mention someone"
  useEffect(() => {
    const input = containerRef.current?.querySelector('textarea');
    if (!input) return;

    const cursorPosition = input.selectionEnd;
    let isMentionOpen = input.value === MENTION_SYMBOL;
    if (!isMentionOpen && cursorPosition >= 2) {
      const lastChars = input.value.slice(cursorPosition - 2, cursorPosition);
      isMentionOpen = lastChars === ` ${MENTION_SYMBOL}` || lastChars === `\n${MENTION_SYMBOL}`;
    }
    setTooltipOpen(isMentionOpen);
  }, [value]);

  const handleChange: OnChangeHandlerFunc = (_event, newValue, _newPlaintextValue, mentions) => {
    currentMentionedUsersRef.current = mentions;
    onValueChange?.(newValue);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLInputElement>) => {
    if (inactive) {
      event.preventDefault();
      return;
    }
    if (event.key === 'Enter' && event.shiftKey === false) {
      if (onReturnKey) {
        event.preventDefault();
        onReturnKey(event);
      }
    }
  };

  return (
    <StyledCommentInput
      ref={containerRef}
      sx={theme => ({
        '& textarea': { color: inactive ? theme.palette.neutralMedium.main : theme.palette.common.black },
      })}
    >
      <MentionsInput
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        maxLength={maxLength}
        onBlur={onBlur}
        placeholder={placeholder}
        inputRef={(textarea: HTMLTextAreaElement) => {
          if (textarea && ariaLabel) {
            textarea.setAttribute('aria-label', ariaLabel);
          }
        }}
        forceSuggestionsAboveCursor={true}
        allowSpaceInQuery={true}
        customSuggestionsContainer={children => (
          <SuggestionsContainer
            anchorElement={popperAnchor}
            disclaimer={vcEnabled && hasVcInteraction && <SuggestionsVCDisclaimer />}
          >
            {children}
          </SuggestionsContainer>
        )}
      >
        <Mention
          trigger={MENTION_SYMBOL}
          data={mentionsEnabled ? findMentionableContributors : []}
          appendSpaceOnAdd={true}
          displayTransform={(_, display) => `${MENTION_SYMBOL}${display}`}
          renderSuggestion={(suggestion, _, __, ___, focused) => {
            const user = suggestion as EnrichedSuggestionDataItem;
            return (
              <ProfileChipView
                key={user.id}
                displayName={user.display}
                avatarUrl={user.avatarUrl}
                city={user.city}
                country={user.country}
                virtualContributor={user.virtualContributor}
                padding={theme => `0 ${gutters(0.5)(theme)} 0 ${gutters(0.5)(theme)}`}
                selected={focused}
              />
            );
          }}
          // Markdown link generated:
          // __id__ and __display__ are replaced by react-mentions,
          // they'll be URL and displayName of the mentioned user
          markup={`[${MENTION_SYMBOL}__display__](__id__)`}
        />
      </MentionsInput>
      {mentionsEnabled && tooltipOpen && (
        <SuggestionsContainer anchorElement={popperAnchor}>
          <Caption sx={{ padding: gutters() }}>{t('components.post-comment.tooltip.mentions')}</Caption>
        </SuggestionsContainer>
      )}
    </StyledCommentInput>
  );
};
