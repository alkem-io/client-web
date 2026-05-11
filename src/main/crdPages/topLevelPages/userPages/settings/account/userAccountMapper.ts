import type { TFunction } from 'i18next';
import type { AccountInformationQuery } from '@/core/apollo/generated/graphql-schema';
import type { ContributorAccountViewProps } from '@/crd/components/contributor/settings/ContributorAccountView.types';
import {
  type AccountResourceKind,
  type ContributorAccountCallbacks,
  mapAccountToViewProps,
} from '../../../contributorAccountMapper';

/** Translator scoped to the contributor-settings namespace. */
export type ContributorSettingsTranslator = TFunction<'crd-contributorSettings'>;

export type { AccountResourceKind };

/** Callbacks resolved at the integration page (CrdUserAccountTab). */
export type UserAccountMapperCallbacks = ContributorAccountCallbacks;

type AccountData = NonNullable<AccountInformationQuery['lookup']['account']>;

/**
 * User-side wrapper around the shared `mapAccountToViewProps` (User Story
 * 2). Resolves the `user.account.*` i18n keys into the actor-agnostic
 * label struct and delegates the rest. Org Account (US9) follows the
 * same pattern with `org.account.*` keys.
 */
export function mapUserAccountToViewProps(
  account: AccountData | undefined,
  loading: boolean,
  t: ContributorSettingsTranslator,
  callbacks: UserAccountMapperCallbacks
): ContributorAccountViewProps {
  return mapAccountToViewProps(
    account,
    loading,
    {
      helpBanner: t('user.account.helpBanner'),
      spaces: { title: t('user.account.spaces.title'), createButton: t('user.account.spaces.createButton') },
      virtualContributors: {
        title: t('user.account.virtualContributors.title'),
        createButton: t('user.account.virtualContributors.createButton'),
      },
      innovationPacks: {
        title: t('user.account.innovationPacks.title'),
        createButton: t('user.account.innovationPacks.createButton'),
      },
      innovationHubs: {
        title: t('user.account.innovationHubs.title'),
        createButton: t('user.account.innovationHubs.createButton'),
      },
      actions: { manage: t('user.account.actions.manage'), delete: t('user.account.actions.delete') },
    },
    callbacks
  );
}
