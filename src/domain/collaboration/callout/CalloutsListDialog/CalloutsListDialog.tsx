import { Dialog, DialogContent, List, ListItem, ListItemIcon, Skeleton, useTheme } from '@mui/material';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import calloutIcons from '../utils/calloutIcons';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import { every, some, times } from 'lodash';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';
import RouterLink from '../../../../core/ui/link/RouterLink';

interface CalloutInfo {
  id: string;
  type: string;
  framing: {
    profile: {
      displayName: string;
      url: string;
    };
  };
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

const defaultRenderCallout = (callout: CalloutInfo) => callout.framing.profile.displayName;

const CalloutsListDialog = <Callout extends CalloutInfo>({
  open = false,
  onClose,
  callouts,
  renderCallout = defaultRenderCallout,
  emptyListCaption,
  loading,
}: CalloutsListDialogProps<Callout>) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [filter, setFilter] = useState<string[]>([]);

  const filterCalloutCallback = useCallback(
    (callout: Callout) => {
      const lowerCaseFilters = filter.map(term => term.toLowerCase());

      return every(
        lowerCaseFilters,
        term =>
          // Any term matches the Callout's displayName
          callout.framing.profile.displayName.toLowerCase().includes(term.toLowerCase()) ||
          // Or any term matches the Callout's flowState
          (callout.flowStates &&
            some(
              callout.flowStates.map(flowState => flowState.toLowerCase()),
              flowState => flowState.includes(term)
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
    <Dialog open={open}>
      <DialogHeader onClose={onClose} title={t('callout.calloutsList.title')} />
      <DialogContent>
        <MultipleSelect
          onChange={setFilter}
          value={filter}
          minLength={2}
          containerProps={{
            marginLeft: 'auto',
          }}
          size="small"
          inlineTerms
          placeholder={t('callout.calloutsList.filter.placeholder')}
        />
        <List>
          {loading && times(3, i => <ListItem key={i} component={Skeleton} />)}
          {(!filteredCallouts || filteredCallouts.length === 0) && (
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
                  {renderCallout(callout)}
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
