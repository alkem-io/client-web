import React, { FC, useState } from 'react';
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
import CharacterCounter from '../../../../common/components/composite/common/CharacterCounter/CharacterCounter';
import { MentionsInput, Mention, OnChangeHandlerFunc, SuggestionDataItem } from 'react-mentions';
import { useMessagingAvailableRecipientsLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { UserFilterInput } from '../../../../core/apollo/generated/graphql-schema';

const MAX_USERS_MENTIONABLE = 10;

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

  const [filter, setFilter] = useState<UserFilterInput>();
  const [loadUsers, { data }] = useMessagingAvailableRecipientsLazyQuery({
    variables: { filter, first: MAX_USERS_MENTIONABLE },
  });
  const users = data?.usersPaginated.users ?? [];

  const onChange: OnChangeHandlerFunc = (event, newValue, newPlaintextValue, mentions) => {
    console.log('onChange', event, newValue, newPlaintextValue, mentions);
    helper.setValue(newValue);
  };

  const queryUsers = (search: string, callback: (users: SuggestionDataItem[]) => void) => {
    console.log('queryUser', search);
    setFilter({ email: search, firstName: search, lastName: search });
    loadUsers().then(() => {
      callback(
        users.map(user => ({
          id: user.id,
          display: user.displayName,
        }))
      );
    });
  };

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
        <MentionsInput value={field.value} onChange={onChange}>
          <Mention
            trigger="@"
            data={queryUsers}
            renderSuggestion={user => {
              return (
                <p>
                  {user.id} {user.display}
                </p>
              );
            }}
          />
        </MentionsInput>
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
