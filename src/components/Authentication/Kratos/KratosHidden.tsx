import { Input } from '@material-ui/core';
import { UiNodeInputAttributes } from '@ory/kratos-client';
import React, { FC } from 'react';
import { KratosProps } from './KratosProps';

interface KratosHiddenProps extends KratosProps {}

export const KratosHidden: FC<KratosHiddenProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  return <Input type={'hidden'} value={attributes.value as string} name={attributes.name} />;
};

export default KratosHidden;
