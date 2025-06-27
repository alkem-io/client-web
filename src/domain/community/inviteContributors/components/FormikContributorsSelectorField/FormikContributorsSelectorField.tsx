import { User, UserFilterInput } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import { ProfileChipView } from '@/domain/community/contributor/ProfileChip/ProfileChipView';
import { Box, SxProps, TextField, Theme, Button } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { useField, useFormikContext } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import { Identifiable } from '@/core/utils/Identifiable';
import { compact, debounce, isArray } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useCurrentUserContext } from '../../../userCurrent/useCurrentUserContext';
import ContributorChip from '../ContributorChip/ContributorChip';
import { ContributorSelectorType, SelectedContributor } from './FormikContributorsSelectorField.models';
import emailParser from './emailParser';
import { DUPLICATED_EMAIL_ERROR } from './FormikContributorsSelectorField.validation';
import { useInView } from 'react-intersection-observer';
import Loading from '@/core/ui/loading/Loading';
import {
  ContributorItem,
  useContributors,
} from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors';
import { createFilterOptions } from '@mui/material/Autocomplete';

const MAX_USERS_SHOWN = 20;
const FETCH_MORE_OPTION_ID = '__LOAD_MORE__';
const LOAD_MORE_OPTION = { id: FETCH_MORE_OPTION_ID, profile: { displayName: 'Load More' }, disabled: true };

// We hydrate users returned by the query with this extra data: disabled, and the reason why they are,
// so we can avoid inviting ourselves, or users already selected
type Hydration<T extends Identifiable> = T & { message?: string; disabled?: boolean };
type HydratorFn = <U extends Identifiable>(users: U[]) => Hydration<U>[];

export interface FormikContributorsSelectorFieldProps {
  name: string;
  sortUsers?: <U extends Identifiable>(results: U[]) => U[];
  filterUsers?: <U extends Identifiable>(users: U) => boolean;
  hydrateUsers?: HydratorFn;
  sx?: SxProps<Theme>;
  allowExternalInvites?: boolean;
  onlyFromParentCommunity?: boolean;
  parentSpaceId?: string;
}

const identityFn = <U extends Identifiable>(results: U[]) => results;
const alwaysTrue = () => true;
const defaultFilter = createFilterOptions();

const FormikContributorsSelectorField = ({
  name = 'selectedContributors',
  sortUsers = identityFn,
  filterUsers = alwaysTrue,
  hydrateUsers = identityFn as HydratorFn,
  sx,
  onlyFromParentCommunity = false,
  allowExternalInvites = !onlyFromParentCommunity,
  parentSpaceId,
}: FormikContributorsSelectorFieldProps) => {
  const { t } = useTranslation();
  const { userModel: currentUser } = useCurrentUserContext();

  // This field is the array of the selected Contributors (userIds or emails for the moment)
  const [field, meta, helpers] = useField<SelectedContributor[]>(name);
  const { validateForm } = useFormikContext();

  const selectedUserIds = useMemo(
    () => compact(field.value.map(user => user.type === ContributorSelectorType.User && user.id)),
    [field.value]
  );

  const setFieldValue = (newValue: SelectedContributor[]) => {
    helpers.setValue(newValue);
    helpers.setTouched(true);

    window.setTimeout(() => {
      // Need to give time for the formik state to get updated before validating
      validateForm();
    }, 10);
  };

  const translateEmailError = (error: string) => {
    if (error === DUPLICATED_EMAIL_ERROR) {
      return t('forms.validations.duplicateEmail');
    }
    return t('forms.validations.invalidEmail');
  };

  // This is an array of strings, or undefined, that represent the validation errors of each Contributor selected
  const validationErrors =
    meta.error && isArray(meta.error)
      ? meta.error.map(
          error =>
            error?.email
              ? translateEmailError(error.email) // The only validation errors really handled at the moment are about emails
              : JSON.stringify(error) // For the rest of validation errors, we'll show whatever yup returns stringified
        )
      : [];

  // Filter users for the Autocomplete
  const [filter, setFilter] = useState<UserFilterInput>();

  const {
    data: contributors = [],
    hasMore,
    loading,
    fetchMore,
  } = useContributors({
    filter,
    parentSpaceId,
    onlyUsersInRole: onlyFromParentCommunity,
    pageSize: MAX_USERS_SHOWN,
  });

  const { ref: intersectionObserverRef, inView: loadMoreInView } = useInView({
    delay: 500,
    trackVisibility: true,
  });

  useEffect(() => {
    if (loadMoreInView && hasMore && !loading) {
      fetchMore();
    }
  }, [loadMoreInView, hasMore, fetchMore]);

  const [autocompleteValue, setAutocompleteValue] = useState<User | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Filter out users that are already selected, and myself
  const listedUsers = useMemo<(Hydration<ContributorItem> | typeof LOAD_MORE_OPTION)[]>(() => {
    if (!inputValue) {
      return [];
    }
    const users = contributors ?? [];

    const filterFunction = (user: ContributorItem) => {
      if (user.id === currentUser?.id) {
        return false;
      }
      if (selectedUserIds.includes(user.id)) {
        return false;
      }
      return filterUsers(user);
    };

    const listedUsers = hydrateUsers(sortUsers(users.filter(filterFunction)));
    if (hasMore) {
      return [...listedUsers, LOAD_MORE_OPTION];
    } else {
      return listedUsers;
    }
  }, [
    currentUser?.id,
    selectedUserIds,
    contributors,
    field.value,
    inputValue,
    hydrateUsers,
    sortUsers,
    filterUsers,
    loadMoreInView,
    hasMore,
  ]);

  const handleSelect = (value: (Identifiable & { profile: { displayName: string } }) | string | null) => {
    helpers.setTouched(true);
    if (!value) {
      return;
    }
    if (typeof value === 'string') {
      return; // This is a call from the Autocomplete, strings will be handled in the text field events
    } else if (typeof value === 'object' && value.id) {
      onAddUser(value);
    }

    // Clear autocomplete on every select
    setAutocompleteValue(null);
    setInputValue('');
  };

  const onAddUser = (user: Identifiable & { profile: { displayName: string } }) => {
    const fieldValue = Array.isArray(field.value) ? field.value : [];
    setFieldValue([
      ...fieldValue,
      { type: ContributorSelectorType.User, id: user.id, displayName: user.profile.displayName },
    ]);
  };

  // Debounce avoids firing a query on every keystroke
  const debouncedSetFilter = useMemo(
    () =>
      debounce((val: string) => {
        setFilter(val ? { email: val, displayName: val } : undefined);
      }, 300),
    []
  );

  const onTextFieldChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetFilter(value);
  };

  // Clean up debounce on unmount
  useEffect(() => () => debouncedSetFilter.cancel(), [debouncedSetFilter]);

  const onTextFieldKeyDown = (event: React.KeyboardEvent) => {
    helpers.setTouched(true);
    if (event.key === 'Enter') {
      event.preventDefault();
      if (allowExternalInvites) {
        onAddContributorEmail();
      }
    }
  };

  const onAddContributorEmail = () => {
    if (inputValue) {
      const emails = emailParser(inputValue);

      const newValues: SelectedContributor[] = emails.map(parsedEmail => ({
        type: ContributorSelectorType.Email,
        ...parsedEmail,
      }));

      const currentFieldValue = Array.isArray(field.value) ? field.value : [];
      setFieldValue([...currentFieldValue, ...newValues]);
      setAutocompleteValue(null);
      setInputValue('');
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const value = field.value;
    if (!Array.isArray(value)) {
      return;
    }
    // Create a new array without the specific contributor
    const nextValue = [...value.slice(0, indexToRemove), ...value.slice(indexToRemove + 1)];
    setFieldValue(nextValue);
  };

  return (
    <Box>
      <Autocomplete
        freeSolo={allowExternalInvites && !onlyFromParentCommunity}
        options={listedUsers}
        getOptionDisabled={option => option.disabled ?? false}
        value={autocompleteValue}
        inputValue={inputValue}
        onInputChange={(event, value) => setInputValue(value)}
        autoHighlight
        getOptionLabel={option => {
          if (typeof option === 'string') {
            return option;
          }
          return option?.profile.displayName;
        }}
        // @ts-ignore
        filterOptions={onlyFromParentCommunity ? defaultFilter : options => options}
        sx={{
          marginBottom: gutters(),
          [`& .${autocompleteClasses.popupIndicator}`]: {
            transform: 'none',
          },
          ...sx,
        }}
        onChange={(_, value) => handleSelect(value)}
        renderOption={(props, row) => {
          if (row.id === FETCH_MORE_OPTION_ID) {
            if (loadMoreInView) {
              return null; // If it's inView at the moment, don't show it, to avoid loading multiple times in the same scroll
            } else {
              return (
                <li {...props} ref={intersectionObserverRef} key={row.id}>
                  <Loading />
                </li>
              );
            }
          } else {
            // Print user row
            const user = row as Hydration<ContributorItem>;
            return (
              <li {...props} key={user.id}>
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
            );
          }
        }}
        renderInput={params => (
          <TextField
            {...params}
            placeholder={t('community.invitations.inviteContributorsDialog.users.placeholder')}
            name={Math.random().toString(36).slice(2)} // Disables autofill in Chrome
            onChange={onTextFieldChange}
            onKeyDown={onTextFieldKeyDown}
            onBlur={() => helpers.setTouched(true)}
            slotProps={{
              input: {
                ...params.InputProps,
                // Adds the button Add and the autocomplete X icon to empty the input
                endAdornment:
                  params.inputProps.value && allowExternalInvites ? (
                    <>
                      <Button onClick={onAddContributorEmail} variant="contained">
                        {t('common.add')}
                      </Button>
                      {params.InputProps.endAdornment}
                    </>
                  ) : null,
              },
            }}
            multiline
          />
        )}
      />
      <Box display="flex" flexDirection="row" gap={gutters(0.5)} flexWrap="wrap">
        {field.value?.map((contributor, index) => (
          <ContributorChip
            key={index}
            contributor={contributor}
            onRemove={() => handleRemove(index)}
            validationError={validationErrors[index]}
          />
        ))}
      </Box>
      {field.value?.length > 9 && (
        <Caption align="right" marginTop={gutters(0.5)}>
          {t('community.invitations.inviteContributorsDialog.users.invitationsSent', { count: field.value.length })}
        </Caption>
      )}
    </Box>
  );
};

export default FormikContributorsSelectorField;
