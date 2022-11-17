import React, { useContext } from 'react';
import { KratosUIContext } from '../KratosUI';
import { getNodeName, getNodeValue } from './helpers';
import { KratosProps } from './KratosProps';

const KratosAcceptTermsCheckbox = ({ node }: KratosProps) => {
  const { hasAcceptedTerms } = useContext(KratosUIContext);

  const value = getNodeValue(node) || hasAcceptedTerms;

  return <input name={getNodeName(node)} type="checkbox" checked={value} value={String(value)} hidden />;
};

export default KratosAcceptTermsCheckbox;
