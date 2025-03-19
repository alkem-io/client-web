import { List, ListItem, ListItemIcon, Skeleton, useTheme } from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';
import calloutIcons from '../utils/calloutIcons';
import { useTranslation } from 'react-i18next';
import { times } from 'lodash';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';
import SearchField from '@/core/ui/search/SearchField';
import JourneyCalloutsListItemTitle from '../../calloutsSet/CalloutsView/CalloutsListItemTitle';
import { CalloutInfo } from '../model/CalloutInfo.model';

export interface CalloutsListProps<Callout extends CalloutInfo> {
  callouts: Callout[] | undefined;
  emptyListCaption?: ReactNode;
  loading?: boolean;
}

const CalloutsList = <Callout extends CalloutInfo>({
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
          const CalloutIcon = calloutIcons[callout.type];
          return (
            <ListItem key={callout.id} disableGutters component={RouterLink} to={callout.framing.profile.url}>
              <ListItemIcon>
                <CalloutIcon sx={{ color: theme.palette.primary.dark }} />
              </ListItemIcon>
              <BlockSectionTitle minWidth={0} noWrap>
                <JourneyCalloutsListItemTitle callout={callout} />
              </BlockSectionTitle>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default CalloutsList;
