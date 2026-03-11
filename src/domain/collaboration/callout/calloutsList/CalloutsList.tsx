import { List, ListItem, ListItemButton, ListItemIcon, Skeleton, useTheme } from '@mui/material';
import { times } from 'lodash-es';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RouterLink from '@/core/ui/link/RouterLink';
import SearchField from '@/core/ui/search/SearchField';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import CalloutsListItemTitle from '../../calloutsSet/CalloutsView/CalloutsListItemTitle';
import { CalloutIcon } from '../icons/calloutIcons';
import type { CalloutModelLight } from '../models/CalloutModelLight';

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
            <ListItem key={callout.id} disableGutters={true}>
              <ListItemButton component={RouterLink} to={callout.framing.profile.url ?? ''} sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: theme.spacing(3) }}>
                  <CalloutIcon
                    framingType={callout.framing.type}
                    allowedTypes={callout.settings?.contribution?.allowedTypes}
                    tooltip={true}
                    iconProps={{ fontSize: 'small', sx: { color: theme.palette.primary.dark } }}
                  />
                </ListItemIcon>
                <BlockSectionTitle minWidth={0} noWrap={true}>
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
