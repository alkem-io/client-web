import React, { FC, useState } from 'react';
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ReactComponent as InfoCircle } from 'bootstrap-icons/icons/info-circle.svg';
import { createMachine } from 'xstate';
import { toDirectedGraph } from '@xstate/graph';
import { Maybe, Lifecycle } from '../../models/graphql-schema';
import { createStyles } from '../../hooks/useTheme';
import Typography from '../core/Typography';
import Button from '../core/Button';
import Icon from '../core/Icon';
import LifecycleVisualizer from '../core/Lifecycle';

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
      <Modal size="lg" show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Current state: {lifecycle.state}
            {nextStates && <p>Next states: {nextStates}</p>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.body}>{lifecycle && <LifecycleVisualizer lifecycle={lifecycle} />}</Modal.Body>
      </Modal>
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
          <OverlayTrigger
            placement={'top'}
            overlay={<Tooltip id="lifecycle-graph">{t('pages.activity.lifecycle-info')}</Tooltip>}
          >
            <Button small inset variant="whiteStatic" onClick={() => setModalVisible(true)}>
              <Icon component={InfoCircle} color="primary" size="sm" />
            </Button>
          </OverlayTrigger>
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
