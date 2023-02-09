import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText, TextField } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { useField } from 'formik';
import { remove } from 'lodash';
import { FC, useState } from 'react';
import { useMessagingAvailableRecipientsLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { User, UserFilterInput } from '../../../../core/apollo/generated/graphql-schema';
import GridContainer from '../../../../core/ui/grid/GridContainer';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import GridItem from '../../../../core/ui/grid/GridItem';
import { gutters } from '../../../../core/ui/grid/utils';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import { ProfileView } from '../common/ProfileChip/ProfileView';
import { UserChip } from './FormikUserSelector/UserChip';

const MAX_USERS_SHOWN = 10;
const GRID_COLUMNS_DESKTOP = 6;
const GRID_COLUMNS_MOBILE = 3;
const uniqueId = () => Math.random().toString(36).slice(2);

interface FormikUserSelectorProps {
  name: string;
  required?: boolean;
  readonly?: boolean;
  onChange?: (currentValue: string[]) => void;
}

export const FormikUserSelector: FC<FormikUserSelectorProps> = ({
  name,
  required,
  readonly,
  onChange,
  ...containerProps
}) => {
  // This field is the array of user Ids
  const [field, meta, helpers] = useField<string[] | undefined>(name);
  const validationError = Boolean(meta.error) && meta.touched;

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
  // Setting name of the text input to a random string also disables autocomplete browser features
  const [autocompleteKey, setAutocompleteKey] = useState<string>(uniqueId());

  const breakpoint = useCurrentBreakpoint();

  const handleSelect = (user: Pick<User, 'id'> | null) => {
    helpers.setTouched(true);

    if (user === null) return;
    let value = field.value;
    if (!value || !Array.isArray(value)) {
      value = [];
    }
    value.push(user.id);
    helpers.setValue(value);
    // Clear autocomplete on every select
    setAutocompleteValue(null);
    setAutocompleteKey(uniqueId()); // Force re-render

    // Call change event:
    onChange && onChange(value);
  };

  const handleRemove = (userId: string) => {
    helpers.setTouched(true);

    const value = field.value;
    if (readonly || !Array.isArray(value) || !userId) return;
    remove(value, id => id === userId);
    helpers.setValue(value);

    // Call change event:
    onChange && onChange(value);
  };

  return (
    <>
      {!readonly && (
        <>
          <Autocomplete
            key={autocompleteKey}
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
                <ProfileView
                  displayName={user.displayName}
                  avatarUrl={user.profile?.avatar?.uri}
                  city={user.profile?.location?.city}
                  country={user.profile?.location?.country}
                />
              </li>
            )}
            renderInput={params => (
              <TextField
                name={autocompleteKey}
                {...params}
                onChange={({ target }) => {
                  setFilter({ email: target.value, firstName: target.value, lastName: target.value });
                  loadUsers();
                }}
                inputProps={{
                  ...params.inputProps,
                  autocomplete: 'none', // disable autocomplete and autofill
                  'aria-autocomplete': 'none',
                }}
              />
            )}
            {...containerProps}
          />
          <FormHelperText error={validationError}>{meta.error}</FormHelperText>
        </>
      )}
      <GridContainer disablePadding marginBottom={gutters(1)}>
        <GridProvider columns={breakpoint === 'xs' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP}>
          {field.value?.map(id => (
            <GridItem columns={3}>
              <UserChip key={id} userId={id} removable={!readonly} onRemove={() => handleRemove(id)} />
            </GridItem>
          ))}
        </GridProvider>
      </GridContainer>
    </>
  );
};
