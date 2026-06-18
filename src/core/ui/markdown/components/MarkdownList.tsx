import type { Element } from 'hast';
import { createElement } from 'react';

interface ReactMarkdownProps {
  node?: Element;
}

const createMarkdownList =
  (component: 'ul' | 'ol') =>
  ({ node, ...props }: ReactMarkdownProps) => {
    // not sure when and what adds the `ordered` property but it results in
    //
    // hook.js:608 Warning: Received `true` for a non-boolean attribute `ordered`.
    // If you want to write it to the DOM, pass a string instead: ordered="true" or ordered={value.toString()}. Error Component Stack
    const newProps = { ...props } as Record<string, unknown>;
    if (Object.hasOwn(newProps, 'ordered')) {
      delete newProps.ordered;
    }

    // marginY={1} against this theme's 10px spacing unit.
    return createElement(component, { style: { marginTop: 10, marginBottom: 10 }, ...newProps });
  };

export default createMarkdownList;
