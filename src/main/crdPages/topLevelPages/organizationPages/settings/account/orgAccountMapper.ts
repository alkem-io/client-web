import type { TFunction } from 'i18next';
import type { AccountInformationQuery } from '@/core/apollo/generated/graphql-schema';
import type { ContributorAccountViewProps } from '@/crd/components/contributor/settings/ContributorAccountView.types';
import {
  type AccountResourceKind,
  type ContributorAccountCallbacks,
  mapAccountToViewProps,
} from '@/main/crdPages/topLevelPages/contributorAccountMapper';

export type ContributorSettingsTranslator = TFunction<'crd-contributorSettings'>;

export type { AccountResourceKind };

/** Callbacks resolved at the integration page (CrdOrgAccountTab). */
export type OrgAccountMapperCallbacks = ContributorAccountCallbacks;

type AccountData = NonNullable<AccountInformationQuery['lookup']['account']>;

/**
 * Org-side wrapper around the shared `mapAccountToViewProps` (User Story
 * 9). Mirrors `mapUserAccountToViewProps` (US2) but resolves
 * `org.account.*` i18n keys instead of `user.account.*`. Privilege
 * gating + view shape are identical — the only difference is the labels.
 */
export function mapOrgAccountToViewProps(
  account: AccountData | undefined,
  loading: boolean,
  t: ContributorSettingsTranslator,
  callbacks: OrgAccountMapperCallbacks
): ContributorAccountViewProps {
  return mapAccountToViewProps(
    account,
    loading,
    {
      helpBanner: t('org.account.helpBanner'),
      spaces: { title: t('org.account.spaces.title'), createButton: t('org.account.spaces.createButton') },
      virtualContributors: {
        title: t('org.account.virtualContributors.title'),
        createButton: t('org.account.virtualContributors.createButton'),
      },
      innovationPacks: {
        title: t('org.account.innovationPacks.title'),
        createButton: t('org.account.innovationPacks.createButton'),
      },
      innovationHubs: {
        title: t('org.account.innovationHubs.title'),
        createButton: t('org.account.innovationHubs.createButton'),
      },
      actions: { manage: t('org.account.actions.manage'), delete: t('org.account.actions.delete') },
    },
    callbacks
  );
}
