import AcceptTermsButton, { AcceptTermsButtonProps } from './AcceptTermsButton';
import { getNodeName, getNodeValue } from './Kratos/helpers';
import { UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { ButtonProps } from '@mui/material';

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
