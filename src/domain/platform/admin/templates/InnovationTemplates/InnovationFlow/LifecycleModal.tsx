import { FC } from 'react';
import { makeStyles } from '@mui/styles';
import { createMachine } from 'xstate';
import { toDirectedGraph } from '@xstate/graph';
import { Lifecycle } from '../../../../../../core/apollo/generated/graphql-schema';
import { Dialog } from '@mui/material';
import InnovationFlowVisualizer from '../InnovationFlowVisualizer';
import { DialogContent, DialogTitle } from '../../../../../../common/components/core/dialog';

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
        {lifecycle && <InnovationFlowVisualizer lifecycle={lifecycle} />}
      </DialogContent>
    </Dialog>
  );
};
