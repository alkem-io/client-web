import type { UiNodeInputAttributes } from '@ory/kratos-client';
import type { FC } from 'react';
import type { KratosProps } from './KratosProps';

interface KratosHiddenProps extends KratosProps {}

export const KratosHidden: FC<KratosHiddenProps> = ({ node }) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  return <input type="hidden" value={attributes.value} name={attributes.name} />;
};

export default KratosHidden;
