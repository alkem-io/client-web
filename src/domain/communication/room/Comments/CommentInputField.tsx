import { Box, InputBaseComponentProps, Paper, Popper, PopperProps, styled } from '@mui/material';
import React, { FC, forwardRef, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mention, MentionsInput, OnChangeHandlerFunc, SuggestionDataItem } from 'react-mentions';
import { useMentionableUsersLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption } from '../../../../core/ui/typography';
import { ProfileChipView } from '../../../community/contributor/ProfileChip/ProfileChipView';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';
import { useCommunityContext } from '../../../community/community/CommunityContext';

export const POPPER_Z_INDEX = 1400; // Dialogs are 1300
const MAX_USERS_LISTED = 30;
export const MENTION_SYMBOL = '@';

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

/**
 * Rounded paper that pops under the input field showing the mentions
 */
interface SuggestionsContainerProps {
  anchorElement: PopperProps['anchorEl'];
}

const SuggestionsContainer: FC<PropsWithChildren<SuggestionsContainerProps>> = ({ anchorElement, children }) => {
  return (
    <Popper open placement="bottom-start" anchorEl={anchorElement} sx={{ zIndex: POPPER_Z_INDEX }}>
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
interface CommentInputFieldProps {
  value: string;
  onValueChange?: (newValue: string) => void;
  onBlur?: () => void;
  inactive?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  onReturnKey?: (event: React.KeyboardEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLInputElement>) => void;
  popperAnchor: SuggestionsContainerProps['anchorElement'];
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

export const CommentInputField: FC<InputBaseComponentProps> = forwardRef<
  HTMLDivElement | null,
  InputBaseComponentProps
>((props, ref) => {
  // Need to extract the properties like this because OutlinedInput doesn't accept an ElementType<CommentInputFieldProps>
  const { value, onValueChange, onBlur, inactive, readOnly, maxLength, onReturnKey, popperAnchor } =
    props as CommentInputFieldProps;

  const { t } = useTranslation();
  const containerRef = useCombinedRefs(null, ref);

  const currentMentionedUsersRef = useRef<SuggestionDataItem[]>([]);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const emptyQueries = useRef<string[]>([]).current;

  const [queryUsers] = useMentionableUsersLazyQuery();

  const { communityId } = useCommunityContext();

  const isAlreadyMentioned = ({ profile }: { profile: { url: string } }) =>
    currentMentionedUsersRef.current.some(mention => mention.id === profile.url);

  const getMentionableUsers = async (search: string): Promise<EnrichedSuggestionDataItem[]> => {
    if (!search || emptyQueries.some(query => search.startsWith(query))) {
      return [];
    }

    const filter = { email: search, displayName: search };

    const { data } = await queryUsers({
      variables: {
        filter,
        first: MAX_USERS_LISTED,
        communityId: communityId ? communityId : undefined,
        includeVirtualContributors: communityId !== '',
      },
    });

    const mentionableVCs = data?.lookup?.community?.virtualContributorsInRole?.filter(vc => {
      return !isAlreadyMentioned(vc) && vc.profile.displayName.toLowerCase().includes(search.toLowerCase());
    });

    const mentionableUsers = data?.usersPaginated.users.filter(user => !isAlreadyMentioned(user));

    if (!mentionableVCs?.length && !mentionableUsers?.length) {
      emptyQueries.push(search);
      return [];
    }

    const mentionableContributors: EnrichedSuggestionDataItem[] = [];

    if (mentionableUsers) {
      mentionableContributors.push(
        ...mentionableUsers.map(user => ({
          id: user.profile.url,
          display: user.profile.displayName,
          avatarUrl: user.profile.avatar?.uri,
          city: user.profile.location?.city,
          country: user.profile.location?.country,
        }))
      );
    }

    if (mentionableVCs) {
      mentionableContributors.push(
        ...mentionableVCs.map(vc => ({
          id: vc.profile.url,
          display: vc.profile.displayName,
          avatarUrl: vc.profile.avatar?.uri,
          virtualContributor: true,
        }))
      );
    }

    return mentionableContributors;
  };

  const findMentionableUsers = async (search: string, callback: (users: EnrichedSuggestionDataItem[]) => void) => {
    const users = await getMentionableUsers(search);
    callback(users);
  };

  // Open a tooltip (which is the same Popper that contains the maching users) but with a helper message
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
        forceSuggestionsAboveCursor
        allowSpaceInQuery
        customSuggestionsContainer={children => (
          <SuggestionsContainer anchorElement={popperAnchor}>{children}</SuggestionsContainer>
        )}
      >
        <Mention
          trigger={MENTION_SYMBOL}
          data={findMentionableUsers}
          appendSpaceOnAdd
          displayTransform={(id, display) => `${MENTION_SYMBOL}${display}`}
          renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => {
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
      {tooltipOpen && (
        <SuggestionsContainer anchorElement={popperAnchor}>
          <Caption sx={{ padding: gutters() }}>{t('components.post-comment.tooltip.mentions')}</Caption>
        </SuggestionsContainer>
      )}
    </StyledCommentInput>
  );
});
