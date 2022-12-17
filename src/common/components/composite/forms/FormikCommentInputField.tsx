import clsx from 'clsx';
import React, { FC, useMemo } from 'react';
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
import SendIcon from '@mui/icons-material/Send';
import { useField, useFormikContext } from 'formik';
import { makeStyles } from '@mui/styles';
import CharacterCounter from '../common/CharacterCounter/CharacterCounter';

const useStyle = makeStyles(theme => ({
  padding: {
    /*
      select the inner div only if state classes are applied
      and offset the text to the left if a tick or error icon is displayed
    */
    '&.is-invalid .w-md-editor-content .w-md-editor-preview, &.is-valid .w-md-editor-content .w-md-editor-preview': {
      paddingRight: 30,
    },
  },
  withTooltipIcon: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
}));

interface CommentInputField extends InputProps {
  name: string;
  required?: boolean;
  disabled?: boolean;
  submitting?: boolean;
  maxLength?: number;
  withCounter?: boolean;
  submitOnReturnKey?: boolean;
  size?: OutlinedInputProps['size'];
}

export const FormikCommentInputField: FC<CommentInputField> = ({
  name,
  required = false,
  disabled = false,
  submitting = false,
  maxLength,
  withCounter = false,
  submitOnReturnKey = false,
  size = 'medium',
}) => {
  const styles = useStyle();
  const [field, meta, helper] = useField(name);
  const validClass = useMemo(() => (!Boolean(meta.error) && meta.touched ? 'is-valid' : undefined), [meta]);
  const invalidClass = useMemo(
    () => (required && Boolean(meta.error) && meta.touched ? 'is-invalid' : undefined),
    [meta, required]
  );
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
    <FormGroup sx={{ paddingBottom: theme => theme.spacing(withCounter ? 2 : 1) }}>
      <FormControl>
        <OutlinedInput
          multiline
          value={field.value}
          className={clsx('form-control', styles.padding, validClass, invalidClass)}
          name={field.name}
          onChange={e => helper.setValue(e.target.value)}
          onKeyDown={onKeyDown}
          readOnly={inactive}
          color={inactive ? ('neutralMedium' as OutlinedInputProps['color']) : 'primary'}
          size={size}
          endAdornment={
            <InputAdornment position="end">
              <IconButton aria-label="post comment" size={'small'} type="submit" disabled={inactive}>
                <SendIcon />
              </IconButton>
            </InputAdornment>
          }
          aria-describedby="filled-weight-helper-text"
          inputProps={{
            'aria-label': 'post comment',
          }}
        />
      </FormControl>
      {withCounter && <CharacterCounter count={field.value?.length} maxLength={maxLength} />}
      {meta.touched && (
        <FormHelperText
          sx={{ marginRight: theme => (withCounter ? theme.spacing(10) : 0) }}
          error={Boolean(meta.error)}
        >
          {meta.error}
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default FormikCommentInputField;
