import React, { ReactNode } from 'react';

const unwrapFragment = (children: ReactNode | ReactNode[], keyPrefix = 'unwrapped-'): ReactNode[] => {
  if (!children) {
    return [];
  }

  const unwrapped: ReactNode[] = [];

  React.Children.forEach(children, (child, i) => {
    if (isFragmentElement(child)) {
      unwrapped.push(...unwrapFragment(child.props.children), keyPrefix + i + '-');
    } else if (React.isValidElement(child)) {
      if (child.key == null) {
        unwrapped.push(React.cloneElement(child, { key: keyPrefix + i }));
      } else {
        unwrapped.push(child);
      }
    }
  });

  return unwrapped;
};

export default unwrapFragment;

function isFragmentElement(node: ReactNode): node is React.ReactElement<{ children?: ReactNode }> {
  return React.isValidElement(node) && node.type === React.Fragment;
}
