import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, FormHelperText, TextField } from '@mui/material';
import { Organization, User } from '../../../../../core/apollo/generated/graphql-schema';
import { useOrganizationsListQuery, useUserSelectorQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { CaptionSmall } from '../../../../../core/ui/typography';
import FlexSpacer from '../../../../../core/ui/utils/FlexSpacer';
import { ProfileChipView } from '../../../../community/contributor/ProfileChip/ProfileChipView';
import { useField } from 'formik';

const MAX_USERS_SHOWN = 2;

interface HostFilterInput {
  displayName?: string;
}

export interface Host {
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
  __typename: 'User' | 'Organization';
}

interface HostSelectorProps {
  name: string;
  host?: Host
}

export const HostSelector: FC<HostSelectorProps> = ({
  name,
  host,
  ...containerProps
}) => {
  const [filter, setFilter] = useState<HostFilterInput>();

  const { data: organizationData } = useOrganizationsListQuery();
  const organizations = useMemo(() => {
    return organizationData?.organizations.map(org => ({
      id: org.id,
      profile: {
        id: org.profile.id,
        displayName: org.profile.displayName,
        visual: {
          uri: org.profile.visual?.uri,
        },
      },
      __typename: org.__typename
    })) ?? [];
  }, [organizationData]);
  const { data: userData } = useUserSelectorQuery({
    variables: { filter, first: MAX_USERS_SHOWN },
    skip: !filter,
  });
  const options = [...organizations, ...userData?.usersPaginated.users ?? []];

  const { t } = useTranslation();
  const [hostValue, setHostValue] = useState<Host>(host as Host);
  const [touched, setTouched] = useState(false);
  const [field, meta, helpers] = useField(name);
  const handleSelect = (host: Host) => {
    setTouched(true);
    console.log(host)
    // helpers.setTouched(true);
    // if (host === null) {
    //   setHostValue(undefined);
    // }
    // helpers.setValue(field.value);
    setHostValue(host);
  };
  const error = touched && !hostValue;
  console.log(hostValue)
  console.log(error)

  return (
    <>
      <Autocomplete
        options={options}
        value={hostValue as Host ?? null}
        defaultValue={host as Host ?? null}
        autoHighlight
        getOptionLabel={option => option.profile.displayName}
        noOptionsText={t('components.user-selector.tooltip')}
        popupIcon={<SearchIcon />}
        onChange={(event, value) => handleSelect(value as Host)}
        renderOption={(props, host) => (
          <li {...props}>
            <ProfileChipView
              displayName={host.profile.displayName}
              avatarUrl={host.profile.visual?.uri}
              city={host.__typename === 'User' ? host.profile.location?.city : undefined}
              country={host.__typename === 'User' ? host.profile.location?.country : undefined}
              width="100%"
            >
              <FlexSpacer />
                <CaptionSmall sx={{ maxWidth: '50%' }}>
                  {t(`common.${host.__typename === 'User' ? 'user' : 'organization'}`)}
                </CaptionSmall>
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
