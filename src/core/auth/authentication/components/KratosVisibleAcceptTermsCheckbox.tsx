import { KratosProps } from './Kratos/KratosProps';
import { getNodeName } from './Kratos/helpers';
import AcceptTermsCheckbox, { AcceptTermsCheckboxProps } from './AcceptTermsCheckbox';

interface KratosVisibleAcceptTermsCheckboxProps extends AcceptTermsCheckboxProps, KratosProps {}

const KratosVisibleAcceptTermsCheckbox = ({ node, ...props }: KratosVisibleAcceptTermsCheckboxProps) => {
  return <AcceptTermsCheckbox name={getNodeName(node)} {...props} />;
};

export default KratosVisibleAcceptTermsCheckbox;
