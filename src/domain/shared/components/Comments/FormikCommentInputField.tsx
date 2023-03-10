import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import SendIcon from '@mui/icons-material/Send';
import {
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
import CharacterCounter from '../../../../common/components/composite/common/CharacterCounter/CharacterCounter';
import TranslationKey from '../../../../types/TranslationKey';
import { useValidationMessageTranslation } from '../../i18n/ValidationMessageTranslation';
import { CommentInputField, MENTION_SYMBOL } from './CommentInputField';
import { CursorPositionInMarkdown, findCursorPositionInMarkdown, MentionMatch } from './utils';
import EmojiSelector from '../../../../core/ui/forms/emoji/EmojiSelector';

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

  return (
    <FormGroup>
      <FormControl>
        <OutlinedInput
          ref={ref}
          multiline
          size={size}
          sx={theme => ({
            '::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
              backgroundColor: theme.palette.background.default,
              width: theme.spacing(7.5),
              height: '100%',
            },
          })}
          startAdornment={
            <InputAdornment position="start">
              <IconButton
                ref={emojiButtonRef}
                aria-label="Insert emoji"
                size="small"
                onClick={() => setEmojiSelectorOpen(!isEmojiSelectorOpen)}
                disabled={inactive || readOnly}
                sx={theme => ({ marginLeft: theme.spacing(-1) })}
              >
                <EmojiEmotionsOutlinedIcon />
              </IconButton>
              <EmojiSelector
                open={isEmojiSelectorOpen}
                onClose={() => setEmojiSelectorOpen(false)}
                anchorElement={emojiButtonRef.current}
                onEmojiClick={emojiClick}
              />
              <IconButton
                aria-label="Mention someone"
                size="small"
                onClick={mentionButtonClick}
                disabled={inactive || readOnly}
              >
                <AlternateEmailIcon />
              </IconButton>
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton aria-label="post comment" size="small" type="submit" disabled={inactive}>
                <SendIcon />
              </IconButton>
            </InputAdornment>
          }
          aria-describedby="filled-weight-helper-text"
          inputComponent={CommentInputField}
          inputProps={{
            value: field.value,
            onValueChange: (newValue: string) => helpers.setValue(newValue),
            onBlur: () => helpers.setTouched(true),
            inactive,
            readOnly,
            maxLength,
            onReturnKey: submitOnReturnKey ? submitForm : undefined,
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
