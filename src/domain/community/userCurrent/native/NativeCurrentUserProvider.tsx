import type { PropsWithChildren } from 'react';
import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { V2FoundationQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { LicenseEntitlementType, RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';
import { useNativeFoundation } from '@/core/foundation/NativeFoundationProvider';
import type { UserModel } from '../../user/models/UserModel';
import { CurrentUserContext } from '../CurrentUserProvider/CurrentUserProvider';
import { toPlatformPrivilegeWrapper } from '../CurrentUserProvider/usePlatformPrivilegeWrapper';
import type { CurrentUserModel } from '../model/CurrentUserModel';

type NativeViewer = V2FoundationQuery['viewer'];
type NativeEntitlement = NonNullable<NonNullable<NativeViewer['account']>['entitlements']>[number];

const ROLE_NAMES = new Set<string>(Object.values(RoleName));
const ENTITLEMENT_NAMES = new Set<string>(Object.values(LicenseEntitlementType));

/** The user settings JSON keys of core.user_settings (extensibility.md:574-575). */
type NativeUserSettings = {
  home_space?: { id?: string; auto_redirect?: boolean };
  dashboard?: { activity_view?: boolean };
  notification_sounds?: { chat_message?: boolean; in_app?: boolean };
  language?: string;
  language_offer_answered?: boolean;
};

/**
 * Legacy availableEntitlements meant remaining capacity (client-repoint.md:181): an entitlement is available when
 * it is unbounded (limit null) or its usage is below its limit.
 */
const availableEntitlements = (entitlements: NativeEntitlement[]): LicenseEntitlementType[] =>
  entitlements
    .filter(
      entitlement =>
        entitlement.limit === null || entitlement.limit === undefined || (entitlement.usage ?? 0) < entitlement.limit
    )
    .map(entitlement => entitlement.name)
    .filter((name): name is LicenseEntitlementType => ENTITLEMENT_NAMES.has(name));

const toUserModel = (viewer: NativeViewer): UserModel | undefined => {
  const actor = viewer.actor;
  if (!actor || actor.actorType !== 'user') return undefined;
  const settings = (actor.settings ?? {}) as NativeUserSettings;
  return {
    id: actor.id,
    firstName: 'firstName' in actor ? (actor.firstName ?? undefined) : undefined,
    lastName: 'lastName' in actor ? (actor.lastName ?? undefined) : undefined,
    profile: {
      displayName: actor.about?.displayName ?? '',
      tagline: actor.about?.tagline ?? undefined,
      url: actor.url ?? undefined,
      avatar: actor.about?.avatar ? { uri: actor.about.avatar.file.url } : undefined,
    },
    settings: {
      homeSpace: settings.home_space
        ? { spaceID: settings.home_space.id, autoRedirect: settings.home_space.auto_redirect }
        : undefined,
      notification: settings.notification_sounds
        ? {
            sound: {
              chatMessage: settings.notification_sounds.chat_message,
              inAppNotification: settings.notification_sounds.in_app,
            },
          }
        : undefined,
      language: settings.language,
      languageOfferAnswered: settings.language_offer_answered,
      dashboard: settings.dashboard ? { activityView: settings.dashboard.activity_view } : undefined,
    },
  };
};

export const toCurrentUserModel = (viewer: NativeViewer | undefined, loading: boolean): CurrentUserModel => {
  const account = viewer?.account ?? undefined;
  const platformPrivileges = viewer?.platformPrivileges ?? [];
  return {
    // A native privilege name is the same string as its legacy enum member where both exist; no name is mapped.
    platformPrivilegeWrapper: viewer
      ? toPlatformPrivilegeWrapper(platformPrivileges as AuthorizationPrivilege[])
      : undefined,
    nativePlatformPrivileges: platformPrivileges,
    userModel: viewer ? toUserModel(viewer) : undefined,
    accountId: account?.id,
    loading,
    loadingMe: loading,
    // As legacy: AuthenticationProvider.tsx:46 provides `verified: true || verified`.
    verified: true,
    isAuthenticated: Boolean(viewer?.session.authenticated),
    platformRoles: (viewer?.platformRoles ?? []).filter((role): role is RoleName => ROLE_NAMES.has(role)),
    accountCanCreate: account?.canCreate,
    // entitlements is null when READ_LICENSE is not held (hidden): no available entitlement is known then.
    accountEntitlements: account ? availableEntitlements(account.entitlements ?? []) : [],
  };
};

/**
 * CurrentUserContext from the native viewer (surface.graphql Viewer), replacing the legacy `me` provider. It observes
 * the one foundation viewer document, so no current-user observer adds a request; the foundation's own error is
 * shown at the root (root.tsx).
 */
export function NativeCurrentUserProvider({ children }: PropsWithChildren) {
  const { data, loading } = useNativeFoundation();
  return <CurrentUserContext value={toCurrentUserModel(data?.viewer, loading)}>{children}</CurrentUserContext>;
}
