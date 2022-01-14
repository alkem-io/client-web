import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../hooks';
import { makeStyles } from '@mui/styles';
import { Lifecycle } from '../../models/graphql-schema';
import { PageProps } from '../../pages';
import LifecycleVisualizer from '../core/LifecycleVisualizer';
import LifecycleButton from '../core/LifecycleButton';
import { useResolvedPath } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  buttonsWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
  },
}));

interface Props extends PageProps {
  data?: Lifecycle;
  id: string;
  onSetNewState: (id: string, newState: string) => void;
}

const EditLifecycle: FC<Props> = ({ paths, data, id, onSetNewState }) => {
  const { pathname: url } = useResolvedPath('./');
  const styles = useStyles();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'lifecycle', real: true }], [paths, url]);
  useUpdateNavigation({ currentPaths });

  const nextEvents = data?.nextEvents || [];

  return (
    <div className={styles.wrapper}>
      {data && <LifecycleVisualizer lifecycle={data} />}
      {nextEvents && (
        <Grid container spacing={1} justifyContent={'flex-end'}>
          {nextEvents.map((x, i) => (
            <Grid item key={i}>
              <LifecycleButton stateName={x} onClick={() => onSetNewState(id, x)} />
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};
export default EditLifecycle;
