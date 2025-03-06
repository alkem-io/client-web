import { Button, FormControl, InputLabel, OutlinedInput } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingListItem from '@/domain/shared/components/SearchableList/LoadingListItem';
import { ListItemLinkProps } from '@/domain/shared/components/SearchableList/ListItemLink';
import JourneyCardHorizontal from '@/domain/journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import { Visual } from '@/domain/common/visual/Visual';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

const MAX_ITEMS_LIMIT = 1000;

export interface SearchableListProps<
  ItemViewProps extends {},
  Item extends SearchableListItem & Omit<ItemViewProps, keyof ListItemLinkProps>
> {
  data: Item[];
  getActions?: (item: SearchableListItem) => React.ReactNode | undefined;
  loading?: boolean;
}

export const searchableListItemMapper =
  (editSuffix?: string) =>
  (item: {
    id: string;
    displayName: string;
    nameID?: string;
    url?: string;
    level?: SpaceLevel;
  }): SearchableListItem => ({
    id: item.id,
    profile: {
      displayName: item.displayName,
      url: item.url ?? `${item.nameID ?? item.id}${editSuffix ?? ''}`,
    },
    level: item.level ?? SpaceLevel.L0,
  });

export interface SearchableListItem {
  id: string;
  profile: {
    url: string;
    displayName: string;
    tagline?: string;
    avatar?: Visual;
    cardBanner?: Visual;
  };
  level: SpaceLevel;
}

export const SearchableList = <
  ItemViewProps extends {},
  Item extends SearchableListItem & Omit<ItemViewProps, keyof ListItemLinkProps>
>({
  data = [],
  loading,
  getActions,
}: SearchableListProps<ItemViewProps, Item>) => {
  const { t } = useTranslation();
  const [filterBy, setFilterBy] = useState('');
  const [limit, setLimit] = useState(10);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };

  const filteredData = useMemo(
    () =>
      data.filter(item => (filterBy ? item.profile?.displayName.toLowerCase().includes(filterBy.toLowerCase()) : true)),
    [filterBy, data]
  );

  const slicedData = useMemo(() => filteredData.slice(0, limit), [filteredData, limit]);

  return (
    <>
      <FormControl fullWidth size={'small'}>
        <OutlinedInput
          placeholder={t('components.searchableList.placeholder')}
          onChange={handleSearch}
          sx={{ background: theme => theme.palette.primary.contrastText }}
        />
      </FormControl>
      <InputLabel> {t('components.searchableList.info', { count: slicedData.length, total: data.length })}</InputLabel>
      {loading ? (
        <>
          <LoadingListItem />
          <LoadingListItem />
          <LoadingListItem />
          <LoadingListItem />
          <LoadingListItem />
          <LoadingListItem />
        </>
      ) : (
        slicedData.map(item => (
          <JourneyCardHorizontal
            key={item.id}
            size="medium"
            space={{ about: { profile: item.profile }, level: item.level }}
            deepness={0}
            seamless
            sx={{ display: 'inline-block', maxWidth: '100%', padding: 0 }}
            actions={getActions ? getActions(item) : undefined}
          />
        ))
      )}
      {filteredData.length > limit && limit < MAX_ITEMS_LIMIT && (
        <Button
          onClick={() => setLimit(x => (x >= MAX_ITEMS_LIMIT ? x : x + 10))}
          variant="outlined"
          sx={{ alignSelf: 'start' }}
        >
          {t('components.searchableList.load-more')}
        </Button>
      )}
    </>
  );
};

export default SearchableList;
