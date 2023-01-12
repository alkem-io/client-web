import { UIEvent } from 'react';

interface Filter {
  (event: UIEvent): boolean;
}

const stopPropagationIf = (filter?: Filter) => (event: UIEvent) => {
  if (!filter?.(event)) {
    event.stopPropagation();
  }
};

export default stopPropagationIf;
