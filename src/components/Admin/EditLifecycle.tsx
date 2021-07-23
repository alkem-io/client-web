import clsx from 'clsx';
import React, { FC, useMemo } from 'react';
import { Lifecycle } from '../../types/graphql-schema';
import { createStyles } from '../../hooks/useTheme';
import { useRouteMatch } from 'react-router';
import { PageProps } from '../../pages';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import LifecycleButton from '../core/LifecycleButton';
import LifecycleVisualizer from '../core/Lifecycle';

const useStyles = createStyles(theme => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  buttonsWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.shape.spacing(1),
  },
}));

interface Props extends PageProps {
  data?: Lifecycle;
  id: string;
  onSetNewState: (id: string, newState: string) => void;
}

const EditLifecycle: FC<Props> = ({ paths, data, id, onSetNewState }) => {
  const { url } = useRouteMatch();
  const styles = useStyles();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'lifecycle', real: true }], [paths, url]);
  useUpdateNavigation({ currentPaths });

  const nextEvents = data?.nextEvents || [];

  return (
    <div className={styles.wrapper}>
      {data && <LifecycleVisualizer lifecycle={data} />}
      {nextEvents && (
        <div className={clsx(styles.buttonsWrapper, 'col-7')}>
          {nextEvents.map((x, i) => (
            <LifecycleButton key={i} stateName={x} onClick={() => onSetNewState(id, x)} />
          ))}
        </div>
      )}
    </div>
  );
};
export default EditLifecycle;
