import { useUserSelectorQuery } from '@/core/apollo/generated/apollo-hooks';
import { User, UserFilterInput } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import { ProfileChipView } from '@/domain/community/contributor/ProfileChip/ProfileChipView';
import { Box, SxProps, TextField, Theme } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { useField } from 'formik';
import { useMemo, useState } from 'react';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import { Identifiable } from '@/core/utils/Identifiable';
import { isArray, uniqWith } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useCurrentUserContext } from '../../../userCurrent/useCurrentUserContext';
import ContributorChip from '../ContributorChip/ContributorChip';
import { ContributorSelectorType, SelectedContributor } from './FormikContributorsSelectorField.models';
import emailParser from './emailParser';

const MAX_USERS_SHOWN = 20;

type HydratorFn = <U extends Identifiable>(users: U[]) => (U & { message?: string; disabled?: boolean })[];

interface FormikContributorsSelectorFieldProps {
  name: string;
  sortUsers?: <U extends Identifiable>(results: U[]) => U[];
  hydrateUsers?: HydratorFn;
  sx?: SxProps<Theme>;
}

const identityFn = <U extends Identifiable>(results: U[]) => results;

export const FormikContributorsSelectorField = ({
  name = 'selectedContributors',
  sortUsers = identityFn,
  hydrateUsers = identityFn as HydratorFn,
  sx,
}: FormikContributorsSelectorFieldProps) => {
  const { t } = useTranslation();
  const { userModel: currentUser } = useCurrentUserContext();

  // This field is the array of the selected Contributors (userIds or emails for the moment)
  const [field, meta, helpers] = useField<SelectedContributor[]>(name);
  const setFieldValue = (newValue: SelectedContributor[]) => {
    const uniqueValues = uniqWith(
      newValue,
      (a, b) =>
        (a.type === ContributorSelectorType.Email && b.type === ContributorSelectorType.Email && a.email === b.email) ||
        (a.type === ContributorSelectorType.User && b.type === ContributorSelectorType.User && a.id === b.id)
    );

    helpers.setValue(uniqueValues);
  };

  // This is an array of strings, or undefined, that represent the validation errors of each Contributor selected
  const validationErrors =
    meta.error && isArray(meta.error)
      ? meta.error.map(
          error =>
            error.email
              ? t('forms.validations.invalidEmail') // The only validation error handled at the moment is "Invalid email"
              : JSON.stringify(error) // For the rest of validation errors, we'll show whatever yup returns stringified
        )
      : [];

  // Filter users for the Autocomplete
  const [filter, setFilter] = useState<UserFilterInput>();
  const { data } = useUserSelectorQuery({
    variables: { filter, first: MAX_USERS_SHOWN },
    skip: !filter,
  });

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
          .filter(user =>
            Array.isArray(field.value)
              ? !field.value.find(c => c.type === ContributorSelectorType.User && c.id === user.id)
              : true
          )
          .filter(user => user.id !== currentUser?.id)
      )
    );
  }, [currentUser?.id, data?.usersPaginated.users, field.value, inputValue, hydrateUsers, sortUsers]);

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

  const onTextFieldChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(value ? { email: value, displayName: value } : undefined); // If no value, the full filter is undefined
  };

  const onTextFieldKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ';' || event.key === ',') {
      event.preventDefault();
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
    }
  };

  const handleRemove = (contributor: SelectedContributor) => {
    helpers.setTouched(true);

    if (contributor.type === ContributorSelectorType.User) {
      const value = field.value;
      if (!Array.isArray(value) || !contributor.id) {
        return;
      }

      const nextValue = value.filter(c => !(c.type === ContributorSelectorType.User && c.id === contributor.id));
      setFieldValue(nextValue);
    } else if (contributor.type === ContributorSelectorType.Email) {
      const value = field.value;
      if (!Array.isArray(value) || !contributor.email) {
        return;
      }

      const nextValue = value.filter(c => !(c.type === ContributorSelectorType.Email && c.email === contributor.email));
      setFieldValue(nextValue);
    }
  };

  return (
    <Box>
      <Autocomplete
        options={listedUsers}
        getOptionDisabled={option => option.disabled ?? false}
        value={autocompleteValue}
        freeSolo
        inputValue={inputValue}
        onInputChange={(event, value) => setInputValue(value)}
        autoHighlight
        getOptionLabel={option => {
          if (typeof option === 'string') {
            return option;
          }
          return option?.profile.displayName;
        }}
        sx={{
          marginBottom: gutters(),
          [`& .${autocompleteClasses.popupIndicator}`]: {
            transform: 'none',
          },
          ...sx,
        }}
        onChange={(_, value) => handleSelect(value)}
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
            placeholder={t('community.invitations.inviteContributorsDialog.users.placeholder')}
            name={Math.random().toString(36).slice(2)} // Disables autofill in Chrome
            onChange={onTextFieldChange}
            onKeyDown={onTextFieldKeyDown}
            multiline
          />
        )}
      />
      <Box display="flex" flexDirection="row" gap={gutters(0.5)} flexWrap="wrap">
        {field.value?.map((contributor, index) => (
          <ContributorChip
            key={index}
            contributor={contributor}
            onRemove={() => handleRemove(contributor)}
            validationError={validationErrors[index]}
          />
        ))}
      </Box>
      {field.value.length > 9 && (
        <Caption align="right" marginTop={gutters(0.5)}>
          {t('community.invitations.inviteContributorsDialog.users.invitationsSent', { count: field.value.length })}
        </Caption>
      )}
    </Box>
  );
};

export default FormikContributorsSelectorField;
