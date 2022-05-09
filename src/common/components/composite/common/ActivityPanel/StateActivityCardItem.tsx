import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, Dialog } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Grid from '@mui/material/Grid';
import { createMachine } from 'xstate';
import { toDirectedGraph } from '@xstate/graph';
import { makeStyles } from '@mui/styles';
import { Lifecycle, Maybe } from '../../../../../models/graphql-schema';
import Typography from '../../../core/Typography';
import LifecycleVisualizer from '../../../core/LifecycleVisualizer';
import { DialogContent, DialogTitle } from '../../../core/dialog';

export interface ActivityCardItemProps {
  lifecycle?: Maybe<Lifecycle>;
}

const useCardStyles = makeStyles(() => ({
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

const useDialogStyles = makeStyles(() => ({
  content: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

export interface LifecycleModalProps {
  lifecycle: Pick<Lifecycle, 'machineDef' | 'state'>;
  show: boolean;
  onHide: () => void;
}

export const LifecycleModal: FC<LifecycleModalProps> = ({ lifecycle, show = false, onHide = () => {} }) => {
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
            <IconButton color="primary" onClick={() => setModalVisible(true)} size="large">
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
