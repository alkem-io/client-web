import { AuthFlowContext } from '@/main/crdPages/auth/AuthShellWrapper';
import LogoutPage from '../pages/LogoutPage';

export const LogoutRoute = () => (
  <AuthFlowContext>
    <LogoutPage />
  </AuthFlowContext>
);

export default LogoutRoute;
