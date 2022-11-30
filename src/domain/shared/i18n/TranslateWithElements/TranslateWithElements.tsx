import React, { cloneElement, ReactElement } from 'react';
import TranslationKey from '../../../../types/TranslationKey';
import { mapValues } from 'lodash';
import { Trans } from 'react-i18next';

type ElementProps<Props extends {}> = Record<string, Partial<Props> | true>;

/**
 * Returns a function to be used like `t()` but with an option to specify
 * named interpolations with React Elements.
 * Given that the translations file has the label defined as "go to <someLink>link name</someLink>",
 * example usage could be:
 * ```
 * const t = TranslateWithElements(<a />);
 * // ...
 * <div>
 *   {t('label', { someLink: { href: 'https://url.example' } })}
 * </div>
 * ```
 * @param element
 * @constructor
 */
const TranslateWithElements =
  <Props extends {}>(element: ReactElement<Props>) =>
  (key: TranslationKey, elementProps: ElementProps<Props> = {}) => {
    const components = mapValues(elementProps, props => cloneElement(element, props === true ? undefined : props));

    // Typescript fails to handle the type
    // @ts-ignore
    return <Trans i18nKey={key} components={components} />;
  };

export default TranslateWithElements;
