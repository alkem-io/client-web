import React, { PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';
import { Actions } from '../actions/Actions';

const CardActions = (props: PropsWithChildren<{}>) => {
  const stopPropagation = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event.stopPropagation();

  return (
    <Actions
      justifyContent="space-between"
      gap={0}
      alignItems="center"
      flexWrap="wrap"
      minHeight={gutters(2)}
      marginTop={1}
      onClick={stopPropagation}
      {...props}
    />
  );
};

export default CardActions;
