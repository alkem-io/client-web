import { UIEvent } from 'react';

const stopPropagationIf = (filter?: { (event: UIEvent): boolean }) => (event: UIEvent) => {
  if (!filter?.(event)) {
    event.stopPropagation();
  }
};

export default stopPropagationIf;
