import { Dialog, DialogContent, List, ListItem, ListItemIcon, Skeleton, useTheme } from '@mui/material';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import calloutIcons from '../utils/calloutIcons';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { some, times } from 'lodash';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';
import RouterLink from '../../../../core/ui/link/RouterLink';
import SearchField from '../../../../core/ui/search/SearchField';
import JourneyCalloutsListItemTitle from '../JourneyCalloutsTabView/JourneyCalloutsListItemTitle';

interface CalloutInfo {
  id: string;
  type: string;
  framing: {
    profile: {
      displayName: string;
      url: string;
    };
  };
  activity: number;
  groupName: string;
  flowStates: string[] | undefined;
}

export interface CalloutsListDialogProps<Callout extends CalloutInfo> {
  open?: boolean;
  onClose?: () => void;
  callouts: Callout[] | undefined;
  renderCallout?: (callout: Callout) => ReactNode;
  emptyListCaption?: ReactNode;
  loading?: boolean;
}

const CalloutsListDialog = <Callout extends CalloutInfo>({
  open = false,
  onClose,
  callouts,
  emptyListCaption,
  loading,
}: CalloutsListDialogProps<Callout>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [filter, setFilter] = useState<string>('');

  const filterCalloutCallback = useCallback(
    (callout: Callout) => {
      const lowerCaseFilter = filter.toLowerCase();

      // If the Callout's name matches the filter
      return (
        callout.framing.profile.displayName.toLowerCase().includes(lowerCaseFilter) ||
        // Or any term matches the Callout's flowState
        (callout.flowStates &&
          some(
            callout.flowStates.map(flowState => flowState.toLowerCase()),
            flowState => flowState.includes(lowerCaseFilter)
          ))
      );
    },
    [filter]
  );

  const filteredCallouts = useMemo(
    () => (callouts && filter.length > 0 ? callouts?.filter(filterCalloutCallback) : callouts),
    [callouts, filter]
  );

  return (
    <Dialog open={open} fullWidth>
      <DialogHeader onClose={onClose} title={t('callout.calloutsList.title')} />
      <DialogContent>
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
              <ListItem key={callout.id} component={RouterLink} to={callout.framing.profile.url}>
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
      </DialogContent>
    </Dialog>
  );
};

export default CalloutsListDialog;
