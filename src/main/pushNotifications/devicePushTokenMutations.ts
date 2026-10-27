import { gql } from '@apollo/client';

/**
 * The two device-push-token mutations, as **inline `gql` documents** imported by
 * both consumers — `useNativePushRegistration` (bind) and `LogoutPage`
 * (unbind) — so the cross-repo wire contract has a single file to read.
 *
 * **Documented deviation.** Every other operation in this repo goes through the
 * generated hooks in `src/core/apollo/generated/`. Those cannot be regenerated
 * under this feature: `pnpm codegen` fails on a clean `develop` because two
 * pre-existing `.graphql` documents still name `updateSpacePlatformSettings`,
 * which server feature 027 renamed to `adminUpdateSpaceVisibility` (baseline
 * finding BF-1, which belongs to 027 and is not fixed here). Once BF-1 is
 * reconciled and codegen runs again, both documents should move to
 * `src/main/pushNotifications/graphql/` beside the web-push ones and this module
 * should be deleted.
 *
 * The inputs are spelled as literal input objects over scalar variables so the
 * wire shape the server validates (`RegisterDevicePushTokenInput { token,
 * platform }`, `UnregisterDevicePushTokenInput { token }`) is visible in the
 * document itself.
 */

export type RegisterDevicePushTokenVariables = {
  token: string;
  /** Unmapped, exactly as `Capacitor.getPlatform()` returns it — the server validates with `@IsIn(['ios', 'android'])`. */
  platform: string;
};

export const RegisterDevicePushTokenDocument = gql`
  mutation RegisterDevicePushToken($token: String!, $platform: String!) {
    registerDevicePushToken(registrationData: { token: $token, platform: $platform })
  }
`;

export type UnregisterDevicePushTokenVariables = {
  token: string;
};

export const UnregisterDevicePushTokenDocument = gql`
  mutation UnregisterDevicePushToken($token: String!) {
    unregisterDevicePushToken(registrationData: { token: $token })
  }
`;
