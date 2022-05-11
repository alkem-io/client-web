import { Grid, GridProps } from '@mui/material';
import React, { PropsWithChildren } from 'react';

/**
 * The purpose of this component is to wrap the Grid component and serve as a common
 * layout helper to add form fields in a responsive way.
 *
 * The ideal way to use it is to pass the optional parameter columns which defaults to 1 column
 * indicating that the child field should occupy the full width of the grid.
 *
 * If we want to put 2 form fields in the same row we'd have 2 <FormRows> with columns={2}
 *
 * If we pass any of the mui standard sizing properties (xs, md, lg...) all this behaviour gets
 * overriden and the passed values prevail.
 */

type ColumnProps = {
  cols?: number;
};

type FormRowProps = ColumnProps | GridProps;

const useColumnMode = (props: PropsWithChildren<FormRowProps>): boolean => {
  // If any of the MUI size properties are set, use normal mode.
  const sizeProperties = ['xs', 'sm', 'md', 'lg', 'xl'];
  for (let sizeProp in sizeProperties) {
    if (sizeProp in props) return false;
  }
  return true;
};

const FormRow = (props: PropsWithChildren<FormRowProps>) => {
  if (useColumnMode(props)) {
    const columns: number = 'cols' in props && typeof props.cols === 'number' && props.cols >= 1 ? props!.cols : 1;
    let md = Math.floor(12 / columns);

    return (
      <Grid item xs={12} md={md} {...props}>
        {props.children}
      </Grid>
    );
  } else {
    // use MUI props
    return (
      <Grid item {...props}>
        {props.children}
      </Grid>
    );
  }
};

export default FormRow;
