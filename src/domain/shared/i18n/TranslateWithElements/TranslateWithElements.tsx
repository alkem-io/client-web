import React, { cloneElement, ReactElement } from 'react';
import TranslationKey from '../../../../types/TranslationKey';
import { mapValues } from 'lodash';
import { Trans } from 'react-i18next';

type Elements<Props extends {}> = Record<string, Partial<Props>>;

const TranslateWithElements =
  <Props extends {}>(element: ReactElement<Props>) =>
  (key: TranslationKey, links: Elements<Props> = {}) => {
    const components = mapValues(links, props => cloneElement(element, props));

    // Typescript fails to handle the type
    // @ts-ignore
    return <Trans i18nKey={key} components={components} />;
  };

export default TranslateWithElements;
