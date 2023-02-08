import React, { FC, useState } from 'react';
import { useField } from 'formik';
import { TextField } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { useMessagingAvailableRecipientsLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { User, UserFilterInput } from '../../../../core/apollo/generated/graphql-schema';
import { UserSelectedView, UserSelectorView } from './FormikUserSelector/UserSelectorView';
import { remove, uniqueId } from 'lodash';
import SearchIcon from '@mui/icons-material/Search';
import { gutters } from '../../../../core/ui/grid/utils';
import PageContent from '../../../../core/ui/content/PageContent';

const MAX_USERS_SHOWN = 10;

interface FormikUserSelectorProps {
  name: string;
  required?: boolean;
  readonly?: boolean;
}

export const FormikUserSelector: FC<FormikUserSelectorProps> = ({ name, required, readonly, ...containerProps }) => {
  // This field is the array of user Ids
  const [field, , helpers] = useField<string[] | undefined>(name);

  const [filter, setFilter] = useState<UserFilterInput>();

  const [loadUsers, { data }] = useMessagingAvailableRecipientsLazyQuery({
    variables: { filter, first: MAX_USERS_SHOWN },
  });

  const users = data?.usersPaginated.users ?? [];
  // Filter out users that are already selected
  const listedUsers = users.filter(user =>
    field.value && field.value.length ? field.value.indexOf(user.id) === -1 : true
  );
  // Clear Autocomplete when a user is selected
  const [autocompleteValue, setAutocompleteValue] = useState<User | null>(null);
  // Autocomplete is re-rendered when we change the key property
  const [autocompleteKey, setAutocompleteKey] = useState<string>(uniqueId());

  const handleSelect = (user: Pick<User, 'id'> | null) => {
    if (user === null) return;
    let value = field.value;
    if (!Array.isArray(value)) {
      value = [];
    }
    value.push(user.id);
    helpers.setValue(value);
    // Clear autocomplete on every select
    setAutocompleteValue(null);
    setAutocompleteKey(uniqueId()); // Force re-render
  };

  const handleRemove = (userId: string) => {
    const value = field.value;
    if (readonly || !Array.isArray(value) || !userId) return;
    remove(value, id => id === userId);
    helpers.setValue(value);
  };

  return (
    <>
      {!readonly && (
        <Autocomplete
          key={autocompleteKey}
          id={autocompleteKey}
          options={listedUsers}
          value={autocompleteValue}
          autoHighlight
          getOptionLabel={option => option.displayName}
          popupIcon={<SearchIcon />}
          sx={{
            marginBottom: gutters(1),
            [`& .${autocompleteClasses.popupIndicator}`]: {
              transform: 'none',
            },
          }}
          onChange={(evt, value) => handleSelect(value)}
          renderOption={(props, user) => (
            <li {...props}>
              <UserSelectorView
                id={user.id}
                displayName={user.displayName}
                avatarUrl={user.profile?.avatar?.uri}
                city={user.profile?.location?.city}
                country={user.profile?.location?.country}
              />
            </li>
          )}
          renderInput={params => (
            <TextField
              {...params}
              onChange={({ target }) => {
                setFilter({ email: target.value, firstName: target.value, lastName: target.value });
                loadUsers();
              }}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'none', // disable autocomplete and autofill
                'aria-autocomplete': 'none',
              }}
            />
          )}
          {...containerProps}
        />
      )}
      <PageContent>
        {field.value?.map(id => (
          <UserSelectedView id={id} removable={!readonly} onRemove={() => handleRemove(id)} />
        ))}
      </PageContent>
    </>
  );
};
