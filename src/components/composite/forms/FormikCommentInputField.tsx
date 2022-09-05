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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useField } from 'formik';
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
  maxLength?: number;
  withCounter?: boolean;
}

export const FormikCommentInputField: FC<CommentInputField> = ({
  name,
  required = false,
  disabled = false,
  maxLength,
  withCounter = false,
}) => {
  const styles = useStyle();
  const [field, meta, helper] = useField(name);
  const validClass = useMemo(() => (!Boolean(meta.error) && meta.touched ? 'is-valid' : undefined), [meta]);
  const invalidClass = useMemo(
    () => (required && Boolean(meta.error) && meta.touched ? 'is-invalid' : undefined),
    [meta]
  );

  return (
    <FormGroup>
      <FormControl>
        <OutlinedInput
          multiline
          value={field.value}
          className={clsx('form-control', styles.padding, validClass, invalidClass)}
          name={field.name}
          onChange={e => helper.setValue(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton aria-label="post comment" size={'small'} type="submit" disabled={disabled}>
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
      {withCounter && <CharacterCounter count={field.value?.length} maxLength={maxLength}></CharacterCounter>}
      {meta.touched && <FormHelperText error={Boolean(meta.error)}>{meta.error}</FormHelperText>}
    </FormGroup>
  );
};
export default FormikCommentInputField;
