import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, Dialog } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Grid from '@material-ui/core/Grid';
import { createMachine } from 'xstate';
import { toDirectedGraph } from '@xstate/graph';
import { createStyles } from '../../../../hooks';
import { Lifecycle, Maybe } from '../../../../models/graphql-schema';
import Typography from '../../../core/Typography';
import LifecycleVisualizer from '../../../core/Lifecycle';
import { DialogContent, DialogTitle } from '../../../core/dialog';

export interface ActivityCardItemProps {
  lifecycle?: Maybe<Lifecycle>;
}

const useCardStyles = createStyles(() => ({
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  capitalize: {
    '& > span': {
      textTransform: 'capitalize',
    },
  },
}));

const useDialogStyles = createStyles(() => ({
  content: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

export interface LifecycleModalProps {
  lifecycle: Lifecycle;
  show: boolean;
  onHide: () => void;
}

const LifecycleModal: FC<LifecycleModalProps> = ({ lifecycle, show = false, onHide = () => {} }) => {
  const styles = useDialogStyles();
  const machine = createMachine(JSON.parse(lifecycle.machineDef));
  const graph = toDirectedGraph(machine);

  // First filter all nodes to find current state, then deduce nextStates from its edges
  const nextStates = graph.children
    .filter(child => lifecycle.state && child.id.endsWith(lifecycle.state))
    .pop()
    ?.edges.map(edge => edge.target.id.split('.').pop())
    .join(', ');

  return (
    <Dialog maxWidth="md" fullWidth aria-labelledby="state-activity-dialog-title" open={show}>
      <DialogTitle id="state-activity-dialog-title" onClose={onHide}>
        Current state: {lifecycle.state}
        {nextStates && <p>Next states: {nextStates}</p>}
      </DialogTitle>
      <DialogContent dividers className={styles.content}>
        {lifecycle && <LifecycleVisualizer lifecycle={lifecycle} />}
      </DialogContent>
    </Dialog>
  );
};

const StateActivityCardItem: FC<ActivityCardItemProps> = ({ lifecycle = null }) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState<boolean>();
  const styles = useCardStyles();
  if (lifecycle == null) {
    return null;
  }

  return (
    <>
      <Grid container item justifyContent={'space-between'} alignItems={'center'}>
        <Grid item className={styles.item}>
          <Typography>State</Typography>
          <Tooltip title={t('pages.activity.lifecycle-info') || ''} arrow placement="top" id="lifecycle-graph">
            <IconButton color="primary" onClick={() => setModalVisible(true)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item className={styles.capitalize}>
          <span>{lifecycle?.state}</span>
        </Grid>
      </Grid>
      <LifecycleModal
        lifecycle={lifecycle}
        show={modalVisible || false}
        onHide={() => {
          setModalVisible(false);
        }}
      />
    </>
  );
};

export default StateActivityCardItem;
