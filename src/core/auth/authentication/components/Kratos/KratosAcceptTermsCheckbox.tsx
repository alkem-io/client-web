import React from 'react';
import { getNodeName, getNodeValue } from './helpers';
import { KratosProps } from './KratosProps';

const KratosAcceptTermsCheckbox = ({ node }: KratosProps) => {
  const value = getNodeValue(node);

  return <input name={getNodeName(node)} type="checkbox" checked={value} value={String(value)} hidden />;
};

export default KratosAcceptTermsCheckbox;
