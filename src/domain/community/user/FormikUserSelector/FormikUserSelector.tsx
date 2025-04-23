import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText, SxProps, TextField, Theme } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { useField } from 'formik';
import { without } from 'lodash';
import { useMemo, useState } from 'react';
import { useUserSelectorQuery } from '@/core/apollo/generated/apollo-hooks';
import { User, UserFilterInput } from '@/core/apollo/generated/graphql-schema';
import GridContainer from '@/core/ui/grid/GridContainer';
import GridProvider from '@/core/ui/grid/GridProvider';
import { gutters } from '@/core/ui/grid/utils';
import { ProfileChipView } from '@/domain/community/contributor/ProfileChip/ProfileChipView';
import { UserChip } from './UserChip';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';
import { useTranslation } from 'react-i18next';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import { CaptionSmall } from '@/core/ui/typography';
import { Identifiable } from '@/core/utils/Identifiable';
import { useScreenLayoutXsDetected } from '@/core/ui/grid/GridContext';

const MAX_USERS_SHOWN = 20;
const GRID_COLUMNS_DESKTOP = 6;
const GRID_COLUMNS_MOBILE = 3;

type HydratorFn = <U extends Identifiable>(users: U[]) => (U & { message?: string; disabled?: boolean })[];

type FormikUserSelectorProps = {
  name: string;
  required?: boolean;
  readonly?: boolean;
  onChange?: (contributorIds: string[]) => void;
  sortUsers?: <U extends Identifiable>(results: U[]) => U[];
  hydrateUsers?: HydratorFn;
  sx?: SxProps<Theme>;
};

const identityFn = <U extends Identifiable>(results: U[]) => results;

export const FormikUserSelector = ({
  name,
  required,
  readonly,
  onChange,
  sortUsers = identityFn,
  hydrateUsers = identityFn as HydratorFn,
  sx,
  ...containerProps
}: FormikUserSelectorProps) => {
  // This field is the array of user Ids
  const [field, meta, helpers] = useField<string[] | undefined>(name);
  const validationError = Boolean(meta.error) && meta.touched;

  const [filter, setFilter] = useState<UserFilterInput>();

  const { data } = useUserSelectorQuery({
    variables: { filter, first: MAX_USERS_SHOWN },
    skip: !filter,
  });

  const { t } = useTranslation();
  const { userModel: currentUser } = useCurrentUserContext();

  // Clear Autocomplete when a user is selected
  const [autocompleteValue, setAutocompleteValue] = useState<User | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Filter out users that are already selected, and myself
  const listedUsers = useMemo(() => {
    if (!inputValue) {
      return [];
    }
    const users = data?.usersPaginated.users ?? [];
    return hydrateUsers(
      sortUsers(
        users
          .filter(user => (Array.isArray(field.value) ? !field.value.includes(user.id) : true))
          .filter(user => user.id !== currentUser?.id)
      )
    );
  }, [currentUser?.id, data?.usersPaginated.users, field.value, inputValue, hydrateUsers, sortUsers]);

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

  const isMobile = useScreenLayoutXsDetected();

  return (
    <>
      {!readonly && (
        <>
          <Autocomplete
            options={listedUsers}
            getOptionDisabled={option => option.disabled ?? false}
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
              ...sx,
            }}
            onChange={(evt, value) => handleSelect(value)}
            renderOption={(props, user) => (
              <li {...props}>
                <ProfileChipView
                  displayName={user.profile.displayName}
                  avatarUrl={user.profile.visual?.uri}
                  city={user.profile.location?.city}
                  country={user.profile.location?.country}
                  width="100%"
                >
                  <FlexSpacer />
                  <CaptionSmall sx={{ maxWidth: '50%' }}>{user.message}</CaptionSmall>
                </ProfileChipView>
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
        <GridProvider columns={isMobile ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP} force>
          {field.value?.map(id => (
            <UserChip key={id} userId={id} removable={!readonly} onRemove={() => handleRemove(id)} />
          ))}
        </GridProvider>
      </GridContainer>
    </>
  );
};
