import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { Lifecycle } from '../../../models/graphql-schema';
import LifecycleVisualizer from '../../../common/components/core/LifecycleVisualizer';
import LifecycleButton from '../../../common/components/core/LifecycleButton';

interface EditLifecycleProps {
  lifecycle: Lifecycle | undefined;
  id: string;
  onSetNewState: (id: string, newState: string) => void;
}

const EditLifecycle: FC<EditLifecycleProps> = ({ lifecycle, id, onSetNewState }) => {
  const nextEvents = lifecycle?.nextEvents || [];

  return (
    <>
      {lifecycle && <LifecycleVisualizer lifecycle={lifecycle} />}
      {nextEvents && (
        <Grid container spacing={1} justifyContent="flex-end">
          {nextEvents.map((x, i) => (
            <Grid item key={i}>
              <LifecycleButton stateName={x} onClick={() => onSetNewState(id, x)} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};
export default EditLifecycle;
