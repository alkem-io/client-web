import { useField } from 'formik';
import { FC, useMemo, useState } from 'react';
import { useOrganizationsListQuery, useUserSelectorQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import { Autocomplete, FormHelperText, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ProfileChipView } from '../../../../community/contributor/ProfileChip/ProfileChipView';
import FlexSpacer from '../../../../../core/ui/utils/FlexSpacer';
import { CaptionSmall } from '../../../../../core/ui/typography';

const MAX_USERS_SHOWN = 10;

interface HostFilterInput {
  displayName?: string;
}

export interface Host {
  type: 'user' | 'organization';
  id: string;
  accountId: string;
  profile: {
    displayName: string;
    location?: {
      city: string;
      country: string;
    };
    visual?: {
      uri?: string;
    };
  };
}

/*
//!!
interface AllHosts extends Omit<Host, 'type'> {
  __typename?: 'User' | 'Organization' | 'VirtualContributor';
}

const mapUserOrOrganizationToHost = (host: AllHosts | undefined): Host | undefined => {
  if (!host || !host.__typename || (host.__typename !== 'User' && host.__typename !== 'Organization')) {
    // We don't allow VirtualContributors as hosts, at least for now
    return undefined;
  }

  return {
    id: host.id,
    accountId: host.accountId,
    type: host.__typename === 'User' ? 'user' : 'organization',
    profile: {
      displayName: host.profile?.displayName ?? '',
      location: host.profile?.location,
      visual: host.profile?.visual,
    },
  };
};
*/

interface HostSelectorProps {
  name: string;
  defaultValue?: {
    accountId: string;
  };
  title?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const HostSelector: FC<HostSelectorProps> = ({ name, defaultValue, ...containerProps }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<HostFilterInput>();

  const { data: organizationData } = useOrganizationsListQuery();
  const { data: userData } = useUserSelectorQuery({
    variables: { filter, first: MAX_USERS_SHOWN },
    skip: !filter,
  });

  const options = useMemo(() => {
    const organizations =
      organizationData?.organizations
        .filter(org => org.account) //!! filter out organizations without account
        .map(org => ({
          id: org.id,
          accountId: org.account!.id,
          type: 'organization',
          profile: {
            id: org.profile.id,
            displayName: org.profile.displayName,
            location: org.profile.location,
            visual: {
              uri: org.profile.visual?.uri,
            },
          },
        })) ?? [];

    const users =
      userData?.usersPaginated.users.map(user => ({
        id: user.id,
        accountId: user.account.id,
        type: 'user',
        profile: {
          id: user.profile.id,
          displayName: user.profile.displayName,
          location: user.profile.location,
          visual: {
            uri: user.profile.visual?.uri,
          },
        },
      })) ?? [];

    return [...organizations, ...users].sort((a, b) => a.profile.displayName.localeCompare(b.profile.displayName));
  }, [organizationData, userData]);

  const [field, meta, helpers] = useField(name);
  const handleSelect = (host: Host | null) => {
    helpers.setTouched(true);
    helpers.setValue(host);
  };
  const error = (meta.touched && !field.value) || !!meta.error;

  return (
    <Autocomplete
      options={options}
      value={field.value}
      autoHighlight
      getOptionLabel={option => option?.profile?.displayName ?? ''}
      noOptionsText={t('components.user-selector.tooltip')}
      popupIcon={<SearchIcon />}
      onChange={(event, value) => handleSelect(value)}
      renderOption={(props, host: Host) => (
        <li {...props}>
          <ProfileChipView
            displayName={host.profile.displayName}
            avatarUrl={host.profile.visual?.uri}
            city={host.profile.location?.city}
            country={host.profile.location?.country}
            width="100%"
          >
            <FlexSpacer />
            <CaptionSmall sx={{ maxWidth: '50%' }}>{t(`common.${host.type}` as const)}</CaptionSmall>
          </ProfileChipView>
        </li>
      )}
      renderInput={params => (
        <>
          <TextField
            {...params}
            name={Math.random().toString(36).slice(2)} // Disables autofill in Chrome
            onChange={({ target }) => {
              if (target.value) {
                setFilter({ displayName: target.value });
              } else {
                setFilter(undefined);
              }
            }}
            inputProps={{
              ...params.inputProps,
              autoComplete: 'new-password', // disable autocomplete and autofill
            }}
            error={error}
          />
          {error && <FormHelperText error>{t('common.field-required')}</FormHelperText>}
        </>
      )}
      {...containerProps}
    />
  );
};

export default HostSelector;
