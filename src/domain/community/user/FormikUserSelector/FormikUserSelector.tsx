import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText, TextField } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { useField } from 'formik';
import { without } from 'lodash';
import { FC, useMemo, useState } from 'react';
import { useMessagingAvailableRecipientsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { User, UserFilterInput } from '../../../../core/apollo/generated/graphql-schema';
import GridContainer from '../../../../core/ui/grid/GridContainer';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { gutters } from '../../../../core/ui/grid/utils';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import { ProfileChipView } from '../../contributor/ProfileChip/ProfileChipView';
import { UserChip } from './UserChip';
import { useUserContext } from '../hooks/useUserContext';
import { useTranslation } from 'react-i18next';

const MAX_USERS_SHOWN = 10;
const GRID_COLUMNS_DESKTOP = 6;
const GRID_COLUMNS_MOBILE = 3;

interface FormikUserSelectorProps {
  name: string;
  required?: boolean;
  readonly?: boolean;
  onChange?: (userIds: string[]) => void;
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

  const { data } = useMessagingAvailableRecipientsQuery({
    variables: { filter, first: MAX_USERS_SHOWN },
    skip: !filter,
  });

  const { t } = useTranslation();
  const { user: currentUser } = useUserContext();

  // Clear Autocomplete when a user is selected
  const [autocompleteValue, setAutocompleteValue] = useState<User | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Filter out users that are already selected, and myself
  const listedUsers = useMemo(() => {
    if (!inputValue) {
      return [];
    }
    const users = data?.usersPaginated.users ?? [];
    return users
      .filter(user => (Array.isArray(field.value) ? !field.value.includes(user.id) : true))
      .filter(user => user.id !== currentUser?.user.id);
  }, [currentUser?.user.id, data?.usersPaginated.users, field.value, inputValue]);

  const breakpoint = useCurrentBreakpoint();

  const handleSelect = (user: Pick<User, 'id'> | null) => {
    helpers.setTouched(true);

    if (user === null) {
      return;
    }

    const value = Array.isArray(field.value) ? field.value : [];

    helpers.setValue([...value, user.id]);

    // Clear autocomplete on every select
    setAutocompleteValue(null);
    setInputValue('');

    onChange?.(value);
  };

  const handleRemove = (userId: string) => {
    helpers.setTouched(true);

    const value = field.value;
    if (readonly || !Array.isArray(value) || !userId) {
      return;
    }

    const nextValue = without(value, userId);
    helpers.setValue(nextValue);

    onChange?.(value);
  };

  return (
    <>
      {!readonly && (
        <>
          <Autocomplete
            options={listedUsers}
            value={autocompleteValue}
            inputValue={inputValue}
            onInputChange={(event, value) => setInputValue(value)}
            autoHighlight
            getOptionLabel={option => option.profile.displayName}
            noOptionsText={t('components.user-selector.tooltip')}
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
                <ProfileChipView
                  displayName={user.profile.displayName}
                  avatarUrl={user.profile.visual?.uri}
                  city={user.profile.location?.city}
                  country={user.profile.location?.country}
                />
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                name={Math.random().toString(36).slice(2)} // Disables autofill in Chrome
                onChange={({ target }) => {
                  if (target.value) {
                    setFilter({ email: target.value, displayName: target.value });
                  } else {
                    setFilter(undefined);
                  }
                }}
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password', // disable autocomplete and autofill
                }}
              />
            )}
            {...containerProps}
          />
          <FormHelperText error={validationError}>{meta.error}</FormHelperText>
        </>
      )}
      <GridContainer disablePadding marginBottom={gutters(1)}>
        <GridProvider columns={breakpoint === 'xs' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP} force>
          {field.value?.map(id => (
            <UserChip key={id} userId={id} removable={!readonly} onRemove={() => handleRemove(id)} />
          ))}
        </GridProvider>
      </GridContainer>
    </>
  );
};
