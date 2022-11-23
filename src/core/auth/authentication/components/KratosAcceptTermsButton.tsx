import AcceptTermsButtonImpl, { AcceptTermsButtonImplProps } from './AcceptTermsButtonImpl';
import { getNodeName, getNodeValue } from './Kratos/helpers';
import { UiNodeInput } from './UiNodeInput';
import { ButtonProps } from '@mui/material';

interface KratosAcceptTermsButtonProps extends AcceptTermsButtonImplProps {
  node: UiNodeInput;
}

const KratosAcceptTermsButton = ({ node, ...props }: KratosAcceptTermsButtonProps) => {
  return (
    <AcceptTermsButtonImpl
      {...props}
      name={getNodeName(node)}
      value={getNodeValue(node)}
      type={node.attributes.type as ButtonProps['type']}
    />
  );
};

export default KratosAcceptTermsButton;
