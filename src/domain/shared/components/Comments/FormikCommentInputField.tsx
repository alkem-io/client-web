import {
  Box,
  ClickAwayListener,
  FormControl,
  FormGroup,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputBaseComponentProps,
  InputProps,
  OutlinedInput,
  OutlinedInputProps,
  Paper,
  Popper,
  PopperProps,
  styled,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import React, { FC, forwardRef, PropsWithChildren, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mention, MentionItem, MentionsInput, OnChangeHandlerFunc, SuggestionDataItem } from 'react-mentions';
import EmojiPicker, { EmojiStyle, SkinTonePickerLocation } from 'emoji-picker-react';
import CharacterCounter from '../../../../common/components/composite/common/CharacterCounter/CharacterCounter';
import { buildUserProfileUrl } from '../../../../common/utils/urlBuilders';
import { useMentionableUsersLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption } from '../../../../core/ui/typography';
import { makeAbsoluteUrl } from '../../../../core/utils/links';
import TranslationKey from '../../../../types/TranslationKey';
import { ProfileChipView } from '../../../community/contributor/ProfileChip/ProfileChipView';
import { useValidationMessageTranslation } from '../../i18n/ValidationMessageTranslation';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import SendIcon from '@mui/icons-material/Send';
import { useCombinedRefs } from '../../utils/useCombinedRefs';

const MAX_USERS_LISTED = 30;
const POPPER_Z_INDEX = 1400; // Dialogs are 1300

interface MentionableUser extends SuggestionDataItem {
  // `id` and `display` are from SuggestionDataItem and used by react-mentions
  id: string;
  display: string;
  avatarUrl: string | undefined;
  city: string | undefined;
  country: string | undefined;
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
 * CommentsInput
 * Wrapper around MentionsInput to style it properly and to query for users on mentions
 */
interface CommentsInputProps {
  value: string;
  onValueChange?: (newValue: string) => void;
  onBlur?: () => void;
  inactive?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  onReturnKey?: (event: React.KeyboardEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLInputElement>) => void;
  popperAnchor: SuggestionsContainerProps['anchorElement'];
}

const StyledCommentsInput = styled(Box)(({ theme }) => ({
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

export const CommentsInput: FC<InputBaseComponentProps> = forwardRef<HTMLDivElement | null, InputBaseComponentProps>(
  (props, ref) => {
    // Need to extract the properties like this because OutlinedInput doesn't accept an ElementType<CommentsInputProps>
    const { value, onValueChange, onBlur, inactive, readOnly, maxLength, onReturnKey, popperAnchor } =
      props as CommentsInputProps;

    const { t } = useTranslation();
    const containerRef = useCombinedRefs(null, ref);

    const [currentMentionedUsers, setCurrentMentionedUsers] = useState<MentionItem[]>([]);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const emptyQueries = useRef<string[]>([]).current;

    const [queryUsers] = useMentionableUsersLazyQuery();

    const findMentionableUsers = async (search: string, callback: (users: MentionableUser[]) => void) => {
      if (!search || emptyQueries.some(query => search.startsWith(query))) {
        callback([]);
        return;
      }
      const filter = { email: search, displayName: search };
      const { data } = await queryUsers({
        variables: { filter, first: MAX_USERS_LISTED },
      });

      const users = data?.usersPaginated.users ?? [];
      if (users.length === 0) {
        emptyQueries.push(search);
      }
      const mentionableUsers = users
        //!! TODO:  Ask Product if we want to mention ourselves and to mention multiple times the same user
        // Only show users that are not already mentioned
        .filter(user => currentMentionedUsers.find(mention => mention.id === user.nameID) === undefined) //!!
        // Map users to MentionableUser
        .map(user => ({
          id: user.nameID,
          display: user.displayName,
          avatarUrl: user.profile?.avatar?.uri,
          city: user.profile?.location?.city,
          country: user.profile?.location?.country,
        }));
      callback(mentionableUsers);
    };

    // Open a tooltip (which is the same Popper that contains the maching users) but with a helper message
    // that says something like "Start typing to mention someone"
    useEffect(() => {
      const input = containerRef.current?.querySelector('textarea');
      if (!input) return;

      const cursorPosition = input.selectionEnd;
      let isMentionOpen = input.value === '@';
      if (!isMentionOpen && cursorPosition >= 2) {
        const lastChars = input.value.slice(cursorPosition - 2, cursorPosition);
        isMentionOpen = lastChars === ' @' || lastChars === '\n@';
      }
      setTooltipOpen(isMentionOpen);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange: OnChangeHandlerFunc = (_event, newValue, _newPlaintextValue, mentions) => {
      // TODO: newPlaintextValue should be the char counter
      setCurrentMentionedUsers(mentions);
      onValueChange && onValueChange(newValue);
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
      <StyledCommentsInput
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
            trigger="@"
            data={findMentionableUsers}
            appendSpaceOnAdd
            displayTransform={(id, display) => `@${display}`}
            renderSuggestion={(suggestion, search, highlightedDisplay, index, focused) => {
              const user = suggestion as MentionableUser;
              return (
                <ProfileChipView
                  key={user.id}
                  displayName={user.display}
                  avatarUrl={user.avatarUrl}
                  city={user.city}
                  country={user.country}
                  padding={theme => `0 ${gutters(0.5)(theme)} 0 ${gutters(0.5)(theme)}`}
                  selected={focused}
                />
              );
            }}
            // Markdown link generated:
            // __id__ and __display__ are replaced by react-mentions,
            // they'll be nameId and displayName of the mentioned user
            markup={`[@__display__](${makeAbsoluteUrl(buildUserProfileUrl('__id__'))})`}
          />
        </MentionsInput>
        {tooltipOpen && (
          <SuggestionsContainer anchorElement={popperAnchor}>
            <Caption sx={{ padding: gutters() }}>{t('components.post-comment.tooltip.mentions')}</Caption>
          </SuggestionsContainer>
        )}
      </StyledCommentsInput>
    );
  }
);

/**
 * Emoji selector
 */
interface EmojiSelectorProps {
  anchorElement: PopperProps['anchorEl'];
  open: boolean;
  onClose: () => void;
  onEmojiClick: (emoji: string, event: MouseEvent) => void;
}

const EmojiSelector: FC<EmojiSelectorProps> = ({ anchorElement, open, onEmojiClick, onClose }) => {
  return (
    <Popper open={open} placement="bottom-start" anchorEl={anchorElement} sx={{ zIndex: POPPER_Z_INDEX }}>
      <ClickAwayListener onClickAway={onClose}>
        <Paper elevation={3}>
          <EmojiPicker
            emojiStyle={EmojiStyle.NATIVE}
            skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
            onEmojiClick={(emoji, event) => onEmojiClick(emoji.emoji, event)}
          />
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

/**
 * Material styles wrapper, with the border and the Send arrow IconButton and the char counter
 * @param param0
 * @returns
 */
interface FormikCommentInputFieldProps extends InputProps {
  name: string;
  disabled?: boolean;
  readOnly?: boolean;
  submitting?: boolean;
  maxLength?: number;
  helpText?: string;
  withCounter?: boolean;
  submitOnReturnKey?: boolean;
  size?: OutlinedInputProps['size'];
}

export const FormikCommentInputField: FC<FormikCommentInputFieldProps> = ({
  name,
  disabled = false,
  readOnly = false,
  submitting = false,
  maxLength,
  helpText,
  withCounter = false,
  submitOnReturnKey = false,
  size = 'medium',
}) => {
  const ref = useRef<HTMLElement>(null);
  const emojiButtonRef = useRef(null);
  const [isEmojiSelectorOpen, setEmojiSelectorOpen] = useState(false);

  const tErr = useValidationMessageTranslation();

  const [field, meta, helpers] = useField<string>(name);
  const { submitForm } = useFormikContext();

  const isError = Boolean(meta.error);
  const helperText = useMemo(() => {
    if (!isError) {
      return helpText;
    }

    return tErr(meta.error as TranslationKey, { field: name });
  }, [isError, meta.error, helpText, name, tErr]);

  const inactive = disabled || submitting;

  const cursorPositionRef = useRef<number | null>(null);

  const mentionButtonClick = () => {
    const input = ref.current?.querySelector('textarea');
    const cursorPosition = input?.selectionEnd ?? field.value.length;

    const newValue = field.value.slice(0, cursorPosition) + ' @' + field.value.slice(cursorPosition);

    cursorPositionRef.current = cursorPosition;
    helpers.setValue(newValue);
  };

  useLayoutEffect(() => {
    const input = ref.current?.querySelector('textarea');
    const cursorPosition = cursorPositionRef.current;
    if (input && cursorPosition !== null) {
      input.focus();
      input.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
    }
    cursorPositionRef.current = null;
  }, [field.value]);

  return (
    <FormGroup>
      <FormControl>
        <OutlinedInput
          ref={ref}
          multiline
          size={size}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                ref={emojiButtonRef}
                aria-label="Insert emoji"
                size="small"
                onClick={() => setEmojiSelectorOpen(!isEmojiSelectorOpen)}
                disabled={inactive || readOnly}
              >
                <EmojiEmotionsOutlinedIcon />
              </IconButton>
              <EmojiSelector
                open={isEmojiSelectorOpen}
                onClose={() => setEmojiSelectorOpen(false)}
                anchorElement={emojiButtonRef.current}
                onEmojiClick={emoji => {
                  helpers.setValue(meta.value + emoji);
                  setEmojiSelectorOpen(false);
                }}
              />
              <IconButton
                aria-label="Mention someone"
                size="small"
                onClick={mentionButtonClick}
                disabled={inactive || readOnly}
              >
                <AlternateEmailIcon />
              </IconButton>
              <IconButton aria-label="post comment" size="small" type="submit" disabled={inactive}>
                <SendIcon />
              </IconButton>
            </InputAdornment>
          }
          aria-describedby="filled-weight-helper-text"
          inputComponent={CommentsInput}
          inputProps={{
            value: field.value,
            onValueChange: (newValue: string) => helpers.setValue(newValue),
            onBlur: () => helpers.setTouched(true),
            inactive,
            readOnly,
            maxLength,
            onReturnkey: submitOnReturnKey ? submitForm : undefined,
            popperAnchor: ref.current,
          }}
        />
      </FormControl>
      <CharacterCounter count={field.value?.length} maxLength={maxLength} disabled={!withCounter}>
        <FormHelperText error={isError}>{helperText}</FormHelperText>
      </CharacterCounter>
    </FormGroup>
  );
};

export default FormikCommentInputField;
