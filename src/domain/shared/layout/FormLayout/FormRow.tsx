import { Grid, GridSize } from '@mui/material';
import React, { PropsWithChildren } from 'react';

/**
 * The purpose of this component is to wrap the Grid component and serve as a common
 * layout helper to add form fields in a responsive way.
 *
 * The ideal way to use it is to pass the optional parameter columns which defaults to 1 column
 * indicating that the child field should occupy 1 column of the grid.
 *
 * If we want to put 2 form fields in the same row we'd have 2 <FormRows> with columns={2}
 *
 * If we pass any of the mui standard sizing properties (xs, md, lg...) all this behaviour gets
 * overriden and the passed values prevail.
 */

interface FormRowProps {
  columns?: number;
  lg?: boolean | GridSize;
  md?: boolean | GridSize;
  sm?: boolean | GridSize;
  xl?: boolean | GridSize;
  xs?: boolean | GridSize;
}

const FormRow = ({ columns, lg, md, sm, xl, xs, children }: PropsWithChildren<FormRowProps>) => {
  const isNotSet = variable => {
    return variable === null || variable === undefined;
  };
  const isSet = variable => {
    return !isNotSet(variable);
  };

  const cols: number = isNotSet(columns) || columns! <= 0 ? 1 : columns!;

  // If the property columns has a value do calculations automatically
  if (isSet(columns) && isNotSet(xs) && isNotSet(sm) && isNotSet(md) && isNotSet(lg) && isNotSet(xl)) {
    xs = 12; // full width of field for small screens
    md = 12;
    if (cols > 1) {
      md = Math.floor(12 / cols);
    }
    return (
      <Grid item xs={xs} md={md}>
        {children}
      </Grid>
    );
  }
  // Else if none of the properties are set, just use full width, same as columns = 1
  else if (isNotSet(columns) && isNotSet(xs) && isNotSet(sm) && isNotSet(md) && isNotSet(lg) && isNotSet(xl)) {
    return (
      <Grid item xs={12}>
        {children}
      </Grid>
    );
  }
  // Else if any of the xs, sm, lg... properties are set just use them
  else {
    return (
      <Grid item xs={xs} md={md} sm={sm} lg={lg} xl={xl}>
        {children}
      </Grid>
    );
  }
};

export default FormRow;
