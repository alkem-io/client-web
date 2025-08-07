import { Children, cloneElement, Fragment, isValidElement, ReactNode } from 'react';
import { isArray } from 'lodash';

type AnyProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const flattenChildren = (children: ReactNode | ReactNode[]) =>
  Children.toArray(children).flatMap((child, index) => {
    if (isArray(child)) {
      return flattenChildren(child);
    }
    if (typeof child === 'string' || typeof child === 'number') {
      return child;
    }

    if (isValidElement<AnyProps>(child)) {
      if (child.type === Fragment) {
        return flattenChildren(child.props.children);
      }

      return child.key ? child : cloneElement(child, { key: index });
    }
    return child;
  });

export default flattenChildren;
