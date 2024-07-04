import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, FormHelperText, TextField } from '@mui/material';
import { useOrganizationsListQuery, useUserSelectorQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { CaptionSmall } from '../../../../../core/ui/typography';
import FlexSpacer from '../../../../../core/ui/utils/FlexSpacer';
import { ProfileChipView } from '../../../../community/contributor/ProfileChip/ProfileChipView';
import { useField } from 'formik';

const MAX_USERS_SHOWN = 10;

interface HostFilterInput {
  displayName?: string;
}

export interface Host {
  type: 'user' | 'organization';
  id: string;
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

interface HostSelectorProps {
  name: string;
  host?: Host;
}

export const mapUserOrOrganizationToHost = (
  host:
    | {
        id: string;
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
        __typename?: 'User' | 'Organization' | 'VirtualContributor';
      }
    | undefined
): Host | undefined => {
  if (!host || !host.__typename || (host.__typename !== 'User' && host.__typename !== 'Organization')) {
    // We don't allouw VirtualContributors as hosts, at least for now
    return undefined;
  }

  return {
    id: host.id,
    type: host.__typename === 'User' ? 'user' : 'organization',
    profile: {
      displayName: host.profile?.displayName ?? '',
      location: host.profile?.location,
      visual: host.profile?.visual,
    },
  };
};

export const HostSelector: FC<HostSelectorProps> = ({ name, host, ...containerProps }) => {
  const [filter, setFilter] = useState<HostFilterInput>();

  const { data: organizationData } = useOrganizationsListQuery();
  const organizations: Host[] = useMemo(() => {
    return (
      organizationData?.organizations.map(org => ({
        id: org.id,
        type: 'organization',
        profile: {
          id: org.profile.id,
          displayName: org.profile.displayName,
          location: org.profile.location,
          visual: {
            uri: org.profile.visual?.uri,
          },
        },
      })) ?? []
    );
  }, [organizationData]);

  const { data: userData } = useUserSelectorQuery({
    variables: { filter, first: MAX_USERS_SHOWN },
    skip: !filter,
  });
  const users: Host[] = useMemo(
    () =>
      userData?.usersPaginated.users.map(user => ({
        id: user.id,
        type: 'user',
        profile: {
          id: user.profile.id,
          displayName: user.profile.displayName,
          location: user.profile.location,
          visual: {
            uri: user.profile.visual?.uri,
          },
        },
      })) ?? [],
    [userData]
  );

  const options = useMemo(() => {
    return [...organizations, ...users].sort((a, b) => a.profile.displayName.localeCompare(b.profile.displayName));
  }, [organizations, users]);

  const { t } = useTranslation();

  const [field, meta, helpers] = useField(name);
  const handleSelect = (host: Host | null) => {
    helpers.setTouched(true);
    helpers.setValue(host);
  };
  const error = (meta.touched && !field.value) || !!meta.error; //!! TODO

  return (
    <>
      <Autocomplete
        options={options}
        value={field.value}
        defaultValue={host}
        autoHighlight
        getOptionLabel={option => option.profile.displayName}
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
    </>
  );
};
