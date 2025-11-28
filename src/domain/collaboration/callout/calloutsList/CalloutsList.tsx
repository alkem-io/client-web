import { List, ListItem, ListItemButton, ListItemIcon, Skeleton, useTheme } from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';
import { CalloutIcon } from '../icons/calloutIcons';
import { useTranslation } from 'react-i18next';
import { times } from 'lodash';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';
import SearchField from '@/core/ui/search/SearchField';
import CalloutsListItemTitle from '../../calloutsSet/CalloutsView/CalloutsListItemTitle';
import { CalloutModelLight } from '../models/CalloutModelLight';

export interface CalloutsListProps<Callout extends CalloutModelLight> {
  callouts: Callout[] | undefined;
  emptyListCaption?: ReactNode;
  loading?: boolean;
}

const CalloutsList = <Callout extends CalloutModelLight>({
  callouts,
  emptyListCaption,
  loading,
}: CalloutsListProps<Callout>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [filter, setFilter] = useState<string>('');

  const filterCalloutCallback = (callout: Callout) => {
    const lowerCaseFilter = filter.toLowerCase();

    // If the Callout's name matches the filter
    return callout.framing.profile.displayName.toLowerCase().includes(lowerCaseFilter);
  };

  const filteredCallouts = useMemo(
    () => (callouts && filter.length > 0 ? callouts?.filter(filterCalloutCallback) : callouts),
    [callouts, filter]
  );

  return (
    <>
      <SearchField
        value={filter}
        onChange={event => setFilter(event.target.value)}
        placeholder={t('callout.calloutsList.filter.placeholder')}
      />
      <List>
        {loading && times(3, i => <ListItem key={i} component={Skeleton} />)}
        {!loading && (!filteredCallouts || filteredCallouts.length === 0) && (
          <ListItem key="_empty">
            <Caption>{emptyListCaption}</Caption>
          </ListItem>
        )}
        {filteredCallouts?.map(callout => {
          return (
            <ListItem key={callout.id} disableGutters>
              <ListItemButton component={RouterLink} to={callout.framing.profile.url ?? ''} sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: theme.spacing(3) }}>
                  <CalloutIcon
                    framingType={callout.framing.type}
                    allowedTypes={callout.settings?.contribution?.allowedTypes}
                    tooltip
                    iconProps={{ fontSize: 'small', sx: { color: theme.palette.primary.dark } }}
                  />
                </ListItemIcon>
                <BlockSectionTitle minWidth={0} noWrap>
                  <CalloutsListItemTitle callout={callout} />
                </BlockSectionTitle>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default CalloutsList;
