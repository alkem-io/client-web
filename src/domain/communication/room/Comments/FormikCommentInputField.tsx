import TranslationKey from '@/core/i18n/utils/TranslationKey';
import CharacterCounter from '@/core/ui/forms/characterCounter/CharacterCounter';
import EmojiSelector from '@/core/ui/forms/emoji/EmojiSelector';
import { gutters } from '@/core/ui/grid/utils';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  FormControl,
  FormGroup,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputProps,
  OutlinedInput,
  OutlinedInputProps,
} from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { FC, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommentInputField, CommentInputFieldProps, MENTION_SYMBOL } from './CommentInputField';
import { CursorPositionInMarkdown, MentionMatch, findCursorPositionInMarkdown } from './utils';

const MENTION_WITH_SPACE = ` ${MENTION_SYMBOL}`;

const getCursorPositionInMention = (
  mention: MentionMatch,
  mentionOffset: number,
  globalOffset: number
): CursorPositionInMarkdown => {
  const afterMention = mention.offset + mention.markdown.length;
  const plainTextPositionAfterMention = globalOffset + mention.plainText.length - mentionOffset;
  return {
    markdown: afterMention,
    plainText: plainTextPositionAfterMention,
  };
};

/**
 * Material styles wrapper, with the border and the Send arrow IconButton and the char counter
 */
export interface FormikCommentInputFieldProps extends InputProps {
  name: string;
  disabled?: boolean;
  readOnly?: boolean;
  submitting?: boolean;
  maxLength?: number;
  helpText?: string;
  counterDisabled?: boolean;
  submitOnReturnKey?: boolean;
  size?: OutlinedInputProps['size'];
  compactMode?: boolean;
  vcInteractions?: CommentInputFieldProps['vcInteractions'];
  vcEnabled?: boolean;
  threadId?: string;
}

export const FormikCommentInputField: FC<FormikCommentInputFieldProps> = ({
  name,
  disabled = false,
  readOnly = false,
  submitting = false,
  maxLength,
  helpText,
  counterDisabled = false,
  submitOnReturnKey = false,
  size = 'medium',
  compactMode = false,
  vcInteractions = [],
  vcEnabled = true,
  threadId = '',
}) => {
  const ref = useRef<HTMLElement>(null);
  const emojiButtonRef = useRef(null);
  const [isEmojiSelectorOpen, setEmojiSelectorOpen] = useState(false);

  const tErr = useValidationMessageTranslation();

  const [field, meta, helpers] = useField<string>(name);
  const { submitForm } = useFormikContext();

  const { t } = useTranslation();

  const isError = Boolean(meta.error);
  const helperText = useMemo(() => {
    if (!isError) {
      return helpText;
    }

    return tErr(meta.error as TranslationKey, { field: name });
  }, [isError, meta.error, helpText, name, tErr]);

  const inactive = disabled || submitting;
  const submitDisabled = inactive || (maxLength ? field.value?.length > maxLength : false);

  const cursorPositionRef = useRef<number | null>(null);

  const insertTextInCursor = (text: string) => {
    const input = ref.current?.querySelector('textarea');
    const cursorPosition = input?.selectionEnd;

    if (!cursorPosition) {
      helpers.setValue(field.value + text);
      return;
    }

    const cursorPositionInMarkdown = findCursorPositionInMarkdown(
      field.value,
      cursorPosition,
      getCursorPositionInMention
    );

    const newValue =
      field.value.slice(0, cursorPositionInMarkdown.markdown) +
      text +
      field.value.slice(cursorPositionInMarkdown.markdown);

    cursorPositionRef.current = cursorPositionInMarkdown.plainText;
    helpers.setValue(newValue);
  };

  const mentionButtonClick = () => {
    insertTextInCursor(MENTION_WITH_SPACE);
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

  const emojiClick = (emoji: string) => {
    insertTextInCursor(emoji);
    setEmojiSelectorOpen(false);
  };

  const buttons = (
    <>
      <IconButton
        ref={emojiButtonRef}
        size="small"
        onClick={() => setEmojiSelectorOpen(!isEmojiSelectorOpen)}
        disabled={inactive || readOnly}
        aria-label={t('messaging.insertEmoji')}
        sx={{ marginLeft: theme => theme.spacing(-1) }}
      >
        <EmojiEmotionsOutlinedIcon fontSize="small" />
      </IconButton>
      <EmojiSelector
        open={isEmojiSelectorOpen}
        onClose={() => setEmojiSelectorOpen(false)}
        anchorElement={emojiButtonRef.current}
        onEmojiClick={emojiClick}
      />
      <IconButton
        size="small"
        onClick={mentionButtonClick}
        disabled={inactive || readOnly}
        aria-label={t('messaging.addMention')}
      >
        <AlternateEmailIcon fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <Box display="flex" flexDirection="row" gap={gutters(0.5)}>
      <FormGroup
        sx={{
          flexGrow: 1,
          flexShrink: 1,
        }}
      >
        <FormControl>
          <OutlinedInput
            ref={ref}
            multiline
            size={size}
            sx={theme => ({
              '::before': compactMode
                ? undefined
                : {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
                    backgroundColor: theme.palette.background.default,
                    width: theme.spacing(6.5),
                    height: '100%',
                  },
            })}
            startAdornment={!compactMode && <InputAdornment position="start">{buttons}</InputAdornment>}
            endAdornment={
              <InputAdornment position="end">
                <IconButton size="small" type="submit" disabled={submitDisabled} aria-label={t('buttons.send')}>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            }
            aria-describedby="filled-weight-helper-text"
            inputComponent={CommentInputField}
            inputProps={{
              vcInteractions,
              vcEnabled,
              threadId,
              value: field.value,
              onValueChange: (newValue: string) => helpers.setValue(newValue),
              onBlur: () => helpers.setTouched(true),
              inactive,
              readOnly,
              maxLength,
              onReturnKey: submitOnReturnKey ? submitForm : undefined,
              popperAnchor: ref.current,
            }}
            fullWidth
          />
        </FormControl>
        <CharacterCounter
          count={field.value?.length}
          maxLength={maxLength}
          disabled={counterDisabled || !maxLength}
          flexWrap={compactMode ? 'wrap' : 'nowrap'}
        >
          {compactMode && (
            <Box
              display="flex"
              alignItems="center"
              paddingX={theme => theme.spacing(0.5)}
              marginY={theme => theme.spacing(0.5)}
              sx={{ backgroundColor: 'background.default' }}
              borderRadius={theme => `${theme.shape.borderRadius}px`}
            >
              {buttons}
            </Box>
          )}
          <FormHelperText error={isError} sx={{ order: compactMode ? 1 : 0 }}>
            <>{helperText}</>
          </FormHelperText>
        </CharacterCounter>
      </FormGroup>
    </Box>
  );
};

export default FormikCommentInputField;
