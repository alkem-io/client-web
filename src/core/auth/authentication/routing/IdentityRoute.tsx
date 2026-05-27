import { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';

const LoginCrdRoute = lazyWithGlobalErrorHandler<object>(() =>
  import('@/main/crdPages/auth/LoginCrdRoute').then(m => ({ default: m.LoginCrdRoute }))
);
const RecoveryCrdRoute = lazyWithGlobalErrorHandler<object>(() =>
  import('@/main/crdPages/auth/RecoveryCrdRoute').then(m => ({ default: m.RecoveryCrdRoute }))
);
const SettingsCrdRoute = lazyWithGlobalErrorHandler<object>(() =>
  import('@/main/crdPages/auth/SettingsCrdRoute').then(m => ({ default: m.SettingsCrdRoute }))
);
const SignUpCrdRoute = lazyWithGlobalErrorHandler<object>(() =>
  import('@/main/crdPages/auth/SignUpCrdRoute').then(m => ({ default: m.SignUpCrdRoute }))
);
const RegistrationCrdRoute = lazyWithGlobalErrorHandler<object>(() =>
  import('@/main/crdPages/auth/SignUpCrdRoute').then(m => ({ default: m.RegistrationCrdRoute }))
);
const VerifyCrdRoute = lazyWithGlobalErrorHandler<object>(() =>
  import('@/main/crdPages/auth/VerifyCrdRoute').then(m => ({ default: m.VerifyCrdRoute }))
);
const ErrorCrdRoute = lazyWithGlobalErrorHandler<object>(() =>
  import('@/main/crdPages/auth/ErrorCrdRoute').then(m => ({ default: m.ErrorCrdRoute }))
);
const CrdAuthRequiredRoute = lazyWithGlobalErrorHandler<object>(() =>
  import('@/main/crdPages/error/CrdAuthRequiredRoute').then(m => ({ default: m.CrdAuthRequiredRoute }))
);
const AuthRequiredPage = lazyWithGlobalErrorHandler(() => import('../pages/AuthRequiredPage'));
const LogoutRoute = lazyWithGlobalErrorHandler(() => import('./LogoutRoute'));

export enum IdentityRoutes {
  Login = 'login',
  Logout = 'logout',
  Registration = 'registration',
  SignUp = 'sign_up',
  Verify = 'verify',
  Recovery = 'recovery',
  Required = 'required',
  Error = 'error',
  Settings = 'settings',
}

export const IdentityRoute = () => {
  const crdEnabled = useCrdEnabled();
  return (
    <>
      {/* Auth screens are un-gated: the CRD screens render for every visitor (see spec 101). */}
      <Route
        path={`${IdentityRoutes.Login}/*`}
        element={
          <Suspense fallback={null}>
            <LoginCrdRoute />
          </Suspense>
        }
      />
      <Route
        path={`${IdentityRoutes.Logout}`}
        element={
          <Suspense fallback={null}>
            <LogoutRoute />
          </Suspense>
        }
      />
      <Route
        path={`${IdentityRoutes.Registration}/*`}
        element={
          <Suspense fallback={null}>
            <RegistrationCrdRoute />
          </Suspense>
        }
      />
      <Route
        path={`${IdentityRoutes.Verify}/*`}
        element={
          <Suspense fallback={null}>
            <VerifyCrdRoute />
          </Suspense>
        }
      />
      <Route
        path={`${IdentityRoutes.Recovery}`}
        element={
          <Suspense fallback={null}>
            <RecoveryCrdRoute />
          </Suspense>
        }
      />
      <Route
        path={`${IdentityRoutes.Required}`}
        element={<Suspense fallback={null}>{crdEnabled ? <CrdAuthRequiredRoute /> : <AuthRequiredPage />}</Suspense>}
      />
      <Route
        path={`${IdentityRoutes.Error}`}
        element={
          <Suspense fallback={null}>
            <ErrorCrdRoute />
          </Suspense>
        }
      />
      <Route
        path={`${IdentityRoutes.Settings}`}
        element={
          <NoIdentityRedirect>
            <Suspense fallback={null}>
              <SettingsCrdRoute />
            </Suspense>
          </NoIdentityRedirect>
        }
      />
      <Route
        path={`${IdentityRoutes.SignUp}`}
        element={
          <NotAuthenticatedRoute>
            <Suspense fallback={null}>
              <SignUpCrdRoute />
            </Suspense>
          </NotAuthenticatedRoute>
        }
      />
    </>
  );
};
