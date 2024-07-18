import { Box, IconButton, InputBaseComponentProps, Paper, Popper, PopperProps, styled, Tooltip } from '@mui/material';
import React, { FC, forwardRef, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mention, MentionsInput, OnChangeHandlerFunc, SuggestionDataItem } from 'react-mentions';
import { useMentionableUsersLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption } from '../../../../core/ui/typography';
import { ProfileChipView } from '../../../community/contributor/ProfileChip/ProfileChipView';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';
import { useCommunityContext } from '../../../community/community/CommunityContext';
import { VcInteraction } from '../../../../core/apollo/generated/graphql-schema';
import { HelpOutlineOutlined } from '@mui/icons-material';

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
  showVcDisclaimer?: boolean;
}

const SuggestionsContainer: FC<PropsWithChildren<SuggestionsContainerProps>> = ({
  anchorElement,
  children,
  showVcDisclaimer = false,
}) => {
  const { t } = useTranslation();

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
          {showVcDisclaimer && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                height: gutters(2),
                alignItems: 'center',
                fontStyle: 'italic',
                padding: theme => `0 ${gutters(0.5)(theme)} 0 ${gutters(0.5)(theme)}`,
                fontSize: 'small',
              }}
            >
              {t('components.post-comment.vc-interactions.disclaimer')}
              <Tooltip
                title={<Caption>{t('components.post-comment.vc-interactions.help')}</Caption>}
                placement="top"
                arrow
              >
                <IconButton size="small" aria-label={t('components.post-comment.vc-interactions.help')}>
                  <HelpOutlineOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
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
  vcInteractions?: Partial<VcInteraction>[];
  threadId?: string;
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
    threadId,
  } = props as CommentInputFieldProps;

  const { t } = useTranslation();
  const containerRef = useCombinedRefs(null, ref);

  const currentMentionedUsersRef = useRef<SuggestionDataItem[]>([]);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const emptyQueries = useRef<string[]>([]).current;

  const [queryUsers] = useMentionableUsersLazyQuery();

  const { communityId } = useCommunityContext();

  const isAlreadyMentioned = ({ profile }: { profile: { url: string } }) =>
    currentMentionedUsersRef.current.some(mention => mention.id === profile.url);

  const hasVcInteraction = vcInteractions.some(interaction => interaction?.threadID === threadId);

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

    const mentionableContributors: EnrichedSuggestionDataItem[] = [];

    if (!hasVcInteraction) {
      data?.lookup?.community?.virtualContributorsInRole?.forEach(vc => {
        if (!isAlreadyMentioned(vc) && vc.profile.displayName.toLowerCase().includes(search.toLowerCase())) {
          mentionableContributors.push({
            id: vc.profile.url,
            display: vc.profile.displayName,
            avatarUrl: vc.profile.avatar?.uri,
            virtualContributor: true,
          });
        }
      });
    }

    data?.usersPaginated.users.forEach(user => {
      if (!isAlreadyMentioned(user)) {
        mentionableContributors.push({
          id: user.profile.url,
          display: user.profile.displayName,
          avatarUrl: user.profile.avatar?.uri,
          city: user.profile.location?.city,
          country: user.profile.location?.country,
        });
      }
    });

    if (!mentionableContributors.length) {
      emptyQueries.push(search);
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
          <SuggestionsContainer anchorElement={popperAnchor} showVcDisclaimer={hasVcInteraction}>
            {children}
          </SuggestionsContainer>
        )}
      >
        <Mention
          trigger={MENTION_SYMBOL}
          data={findMentionableUsers}
          appendSpaceOnAdd
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
      {tooltipOpen && (
        <SuggestionsContainer anchorElement={popperAnchor}>
          <Caption sx={{ padding: gutters() }}>{t('components.post-comment.tooltip.mentions')}</Caption>
        </SuggestionsContainer>
      )}
    </StyledCommentInput>
  );
});
