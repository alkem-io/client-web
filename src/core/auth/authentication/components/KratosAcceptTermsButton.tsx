import AcceptTermsButton, { AcceptTermsButtonProps } from './AcceptTermsButton';
import { getNodeName, getNodeValue } from './Kratos/helpers';
import { UiNodeInput } from './Kratos/UiNodeInput';
import { ButtonProps } from '@mui/material';

interface KratosAcceptTermsButtonProps extends AcceptTermsButtonProps {
  node: UiNodeInput;
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
