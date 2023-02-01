import React, { FC } from 'react';
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
import { Send } from '@mui/icons-material';
import { useField, useFormikContext } from 'formik';
import CharacterCounter from '../common/CharacterCounter/CharacterCounter';
import MarkdownTextField from '../../../../core/ui/markdown/editor/MarkdownTextField';

interface CommentInputField extends InputProps {
  name: string;
  disabled?: boolean;
  submitting?: boolean;
  maxLength?: number;
  withCounter?: boolean;
  submitOnReturnKey?: boolean;
  size?: OutlinedInputProps['size'];
}

export const FormikCommentInputField: FC<CommentInputField> = ({
  name,
  disabled = false,
  submitting = false,
  maxLength,
  withCounter = false,
  submitOnReturnKey = false,
  size = 'medium',
}) => {
  const [field, meta, helper] = useField(name);

  const { submitForm } = useFormikContext();

  const inactive = disabled || submitting;

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> | undefined = submitOnReturnKey
    ? event => {
        if (event.key === 'Enter' && event.shiftKey === false) {
          event.preventDefault();
          !inactive && submitForm();
        }
      }
    : undefined;

  return (
    <FormGroup>
      <FormControl>
        <MarkdownTextField value={field.value} onChange={value => helper.setValue(value)} />
        <OutlinedInput
          multiline
          value={field.value}
          name={field.name}
          onChange={e => helper.setValue(e.target.value)}
          onKeyDown={onKeyDown}
          readOnly={inactive}
          color={inactive ? ('neutralMedium' as OutlinedInputProps['color']) : 'primary'}
          size={size}
          endAdornment={
            <InputAdornment position="end">
              <IconButton aria-label="post comment" size={'small'} type="submit" disabled={inactive}>
                <Send />
              </IconButton>
            </InputAdornment>
          }
          aria-describedby="filled-weight-helper-text"
          inputProps={{
            'aria-label': 'post comment',
          }}
        />
      </FormControl>
      <CharacterCounter count={field.value?.length} maxLength={maxLength} disabled={!withCounter}>
        <FormHelperText error={Boolean(meta.error)}>{meta.error}</FormHelperText>
      </CharacterCounter>
    </FormGroup>
  );
};

export default FormikCommentInputField;
