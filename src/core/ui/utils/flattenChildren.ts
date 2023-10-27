import { Children, cloneElement, Fragment, ReactNode } from 'react';
import { isArray } from 'lodash';

const flattenChildren = (children: ReactNode | ReactNode[]) =>
  Children.toArray(children).flatMap((child, index) => {
    if (isArray(child)) {
      return flattenChildren(child);
    }
    if (typeof child === 'string' || typeof child === 'number') {
      return child;
    }
    if ('type' in child && child.type === Fragment) {
      return flattenChildren(child.props.children);
    }
    if ('props' in child) {
      return child.key ? child : cloneElement(child, { key: index });
    }
    return child;
  });

export default flattenChildren;
