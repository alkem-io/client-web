import { MouseEvent } from 'react';

const stopPropagation = (event: MouseEvent) => {
  event.stopPropagation();
};

export default stopPropagation;
