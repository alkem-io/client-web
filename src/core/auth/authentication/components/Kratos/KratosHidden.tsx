import { UiNodeInputAttributes } from '@ory/kratos-client';
import { FC } from 'react';
import { KratosProps } from './KratosProps';

interface KratosHiddenProps extends KratosProps {}

export const KratosHidden: FC<KratosHiddenProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  return <input type="hidden" value={attributes.value} name={attributes.name} />;
};

export default KratosHidden;
