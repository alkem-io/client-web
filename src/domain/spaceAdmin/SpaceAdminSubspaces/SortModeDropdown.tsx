import { Box, CircularProgress, FormControl, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { refetchSubspacesInSpaceQuery, useUpdateSpaceSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import { SpaceSortMode } from '@/core/apollo/generated/graphql-schema';
import { Caption } from '@/core/ui/typography';

type SortModeDropdownProps = {
  spaceId: string;
  currentSortMode: SpaceSortMode;
};

const SortModeDropdown: FC<SortModeDropdownProps> = ({ spaceId, currentSortMode }) => {
  const { t } = useTranslation();

  const [updateSpaceSettings, { loading }] = useUpdateSpaceSettingsMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId })],
    awaitRefetchQueries: true,
  });

  const handleChange = (event: SelectChangeEvent) => {
    const sortMode = event.target.value as SpaceSortMode;
    updateSpaceSettings({
      variables: {
        settingsData: {
          spaceID: spaceId,
          settings: {
            sortMode,
          },
        },
      },
    });
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Caption>{t('pages.admin.space.sections.subspaces.sortBy')}</Caption>
      <FormControl size="small">
        <Select
          aria-label={t('pages.admin.space.sections.subspaces.sortBy')}
          value={currentSortMode}
          onChange={handleChange}
          disabled={loading}
        >
          <MenuItem value={SpaceSortMode.Alphabetical}>
            {t('pages.admin.space.sections.subspaces.sortMode.alphabetical')}
          </MenuItem>
          <MenuItem value={SpaceSortMode.Custom}>{t('pages.admin.space.sections.subspaces.sortMode.custom')}</MenuItem>
        </Select>
      </FormControl>
      {loading && <CircularProgress size={20} />}
    </Box>
  );
};

export default SortModeDropdown;
