import { Dialog, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import { toDirectedGraph } from '@xstate/graph';
import { ReactComponent as InfoCircle } from 'bootstrap-icons/icons/info-circle.svg';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createMachine } from 'xstate';
import { createStyles } from '../../hooks/useTheme';
import { Lifecycle, Maybe } from '../../models/graphql-schema';
import Button from '../core/Button';
import Icon from '../core/Icon';
import LifecycleVisualizer from '../core/Lifecycle';
import Typography from '../core/Typography';

export interface ActivityCardItemProps {
  lifecycle?: Maybe<Lifecycle>;
}

const useCardStyles = createStyles(() => ({
  item: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',

    '& > span': {
      textTransform: 'capitalize',
    },
  },
  title: {
    display: 'flex',
    alignItems: 'center',

    '& > p': {
      marginBottom: 0,
    },
  },
}));

const useUserPopUpStyles = createStyles(theme => ({
  body: {
    maxHeight: 600,
    overflow: 'auto',
  },
  activeState: {
    color: theme.palette.neutralLight.main,
  },
}));

export interface LifecycleModalProps {
  lifecycle: Lifecycle;
  show: boolean;
  onHide: () => void;
}

const LifecycleModal: FC<LifecycleModalProps> = ({ lifecycle, show = false, onHide = () => {} }) => {
  const styles = useUserPopUpStyles();
  const machine = createMachine(JSON.parse(lifecycle.machineDef));
  const graph = toDirectedGraph(machine);

  // First filter all nodes to find current state, then deduce nextStates from its edges
  const nextStates = graph.children
    .filter(child => lifecycle.state && child.id.endsWith(lifecycle.state))
    .pop()
    ?.edges.map(edge => edge.target.id.split('.').pop())
    .join(', ');

  return (
    <div>
      <Dialog fullWidth maxWidth="md" open={show} onClose={onHide}>
        <DialogTitle id="contained-modal-title-vcenter">Current state: {lifecycle.state}</DialogTitle>
        <DialogContent className={styles.body}>
          <DialogContentText>{nextStates && <p>Next states: {nextStates}</p>}</DialogContentText>
          {lifecycle && <LifecycleVisualizer lifecycle={lifecycle} />}
        </DialogContent>
      </Dialog>
    </div>
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
    <div>
      <div className={styles.item}>
        <div className={styles.title}>
          <Typography as={'p'}>State</Typography>
          <Tooltip title={t('pages.activity.lifecycle-info') || ''} id="lifecycle-graph">
            <span>
              <Button
                small
                inset
                variant="whiteStatic"
                onClick={() => setModalVisible(true)}
                startIcon={<Icon component={InfoCircle} color="primary" size="sm" />}
              />
            </span>
          </Tooltip>
        </div>
        <span>{lifecycle?.state}</span>
      </div>
      <LifecycleModal
        lifecycle={lifecycle}
        show={modalVisible || false}
        onHide={() => {
          setModalVisible(false);
        }}
      ></LifecycleModal>
    </div>
  );
};

export default StateActivityCardItem;
