import React from 'react';
import { getNodeName, getNodeValue } from './helpers';
import { KratosProps } from './KratosProps';

const KratosAcceptTermsCheckbox = ({ node }: KratosProps) => {
  const value = getNodeValue(node);
  // This is a hidden checkbox to pass with the rest of the kratos form
  return <input name={getNodeName(node)} type="checkbox" checked={value} value={String(value)} hidden readOnly />;
};

export default KratosAcceptTermsCheckbox;
