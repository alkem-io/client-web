import { Dialog, DialogContent } from '@mui/material';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import LinksList from '../../../../core/ui/list/LinksList';
import calloutIcons from '../utils/calloutIcons';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import { some } from 'lodash';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';

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

interface CalloutsListDialogProps<Callout extends CalloutInfo> {
  open?: boolean;
  onClose?: () => void;
  callouts: Callout[] | undefined;
  renderCallout?: (callout: Callout) => ReactNode;
  emptyListCaption?: string;
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
  const [filter, setFilter] = useState<string[]>([]);

  const filterCalloutCallback = useCallback(
    callout => {
      const lowerCaseFilters = filter.map(term => term.toLowerCase());

      return some(
        lowerCaseFilters,
        term =>
          // Any term matches the Callout's displayName
          callout.framing.profile.displayName.toLowerCase().includes(term.toLowerCase()) ||
          // Or any term matches the Callout's flowState and groupName is equal to Contribute_2
          (callout.groupName === CalloutGroupName.Contribute_2 &&
            callout.flowStates &&
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
      <DialogHeader onClose={onClose} title={t('common.collaborationTools')}>
        <MultipleSelect
          onChange={setFilter}
          value={filter}
          minLength={2}
          containerProps={{
            marginLeft: 'auto',
          }}
          size="small"
          inlineTerms
        />
      </DialogHeader>
      <DialogContent>
        <LinksList
          items={
            filteredCallouts?.map(callout => {
              const CalloutIcon = calloutIcons[callout.type];
              return {
                id: callout.id,
                title: renderCallout(callout),
                icon: <CalloutIcon />,
                uri: callout.framing.profile.url,
              };
            }) ?? []
          }
          emptyListCaption={emptyListCaption}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CalloutsListDialog;
