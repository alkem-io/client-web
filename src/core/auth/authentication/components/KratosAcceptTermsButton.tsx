import type { ButtonProps } from '@mui/material';
import type { UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import AcceptTermsButton, { type AcceptTermsButtonProps } from './AcceptTermsButton';
import { getNodeName, getNodeValue } from './Kratos/helpers';

interface KratosAcceptTermsButtonProps extends AcceptTermsButtonProps {
  node: UiNode & { attributes: UiNodeInputAttributes };
}

const KratosAcceptTermsButton = ({ node, ...props }: KratosAcceptTermsButtonProps) => {
  return (
    <AcceptTermsButton
      {...props}
      name={getNodeName(node)}
      value={getNodeValue(node)}
      type={node.attributes.type as ButtonProps['type']}
    />
  );
};

export default KratosAcceptTermsButton;
