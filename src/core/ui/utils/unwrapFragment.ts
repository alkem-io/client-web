import { Fragment, ReactNode } from 'react';

const unwrapFragment = (children: ReactNode) => {
  if (Array.isArray(children) || !children) {
    return children;
  }

  if (children['type'] === Fragment) {
    return children['props']['children'];
  }

  return children;
};

export default unwrapFragment;
