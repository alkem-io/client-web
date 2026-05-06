import {
  AiPersonaEngine,
  AuthorizationPrivilege,
  VirtualContributorBodyOfKnowledgeType,
} from '@/core/apollo/generated/graphql-schema';
import type { CompactContributorCardItem } from '@/crd/components/common/CompactContributorCard';
import type { ReferenceLink } from '@/crd/components/organization/OrganizationProfileSidebar';
import type {
  BodyOfKnowledge,
  SpaceProfileSummary,
} from '@/crd/components/virtualContributor/VCBodyOfKnowledgeSection';
import type { ModelCardSummary } from '@/crd/components/virtualContributor/VCContentView';
import type { VirtualContributorModelFull } from '@/domain/community/virtualContributor/model/VirtualContributorModelFull';
import { KNOWLEDGE_BASE_PATH } from '@/main/routing/urlBuilders';
import { normaliseReferences } from '../../organizationPages/publicProfile/organizationProfileMapper';

export type BoKResolverInput = {
  vc: VirtualContributorModelFull | undefined;
  bokSpaceProfile?: { id?: string; displayName?: string; url?: string } | null;
  hasSpaceReadAccess?: boolean;
  knowledgeBaseDescription?: string;
  knowledgeBasePlaceholder: string;
  knowledgeBaseHasReadAccess?: boolean;
  privateSpaceLabel: string;
  externalAssistantDescription: string;
  externalGenericDescription: string;
  /**
   * Resolved caption rendered above the space-backed BoK card. Per FR-033 /
   * contracts/vcProfile.ts, this is `components.profile.fields.bodyOfKnowledge.spaceBokDescription`
   * with `{vcName}` already interpolated by the caller.
   */
  spaceContextDescription: string;
};

export const resolveBodyOfKnowledge = (input: BoKResolverInput): BodyOfKnowledge | null => {
  const { vc } = input;
  if (!vc) return null;
  const isExternal = vc.modelCard?.aiEngine?.isExternal ?? false;
  const type = vc.bodyOfKnowledgeType;

  if (type === VirtualContributorBodyOfKnowledgeType.AlkemioSpace) {
    const spaceProfile: SpaceProfileSummary = input.hasSpaceReadAccess
      ? {
          id: input.bokSpaceProfile?.id ?? vc.bodyOfKnowledgeID ?? '',
          url: input.bokSpaceProfile?.url ?? '',
          displayName: input.bokSpaceProfile?.displayName ?? '',
          level: 'L0',
          avatarImageUrl: null,
        }
      : {
          id: '',
          url: '',
          displayName: input.privateSpaceLabel,
          level: 'L0',
          avatarImageUrl: null,
        };

    return {
      kind: 'space',
      spaceProfile,
      hasReadAccess: Boolean(input.hasSpaceReadAccess),
      description: vc.bodyOfKnowledgeDescription ?? null,
      vcDisplayName: vc.profile.displayName,
      spaceContextDescription: input.spaceContextDescription,
    };
  }

  if (type === VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase) {
    return {
      kind: 'knowledgeBase',
      description: input.knowledgeBaseDescription || input.knowledgeBasePlaceholder,
      hasReadAccess: Boolean(input.knowledgeBaseHasReadAccess),
      visitUrl: `${vc.profile.url}/${KNOWLEDGE_BASE_PATH}`,
    };
  }

  if (isExternal) {
    const isAssistant = vc.aiPersona?.engine === AiPersonaEngine.OpenaiAssistant;
    return {
      kind: 'external',
      description: isAssistant ? input.externalAssistantDescription : input.externalGenericDescription,
    };
  }

  return null;
};

/**
 * Pass-through normaliser for the VC's references. The social/non-social split
 * (and brand-resolution for the social subset) lives entirely inside the
 * shared `SocialLinks` primitive at `@/crd/components/common/SocialLinks` —
 * the sidebar's References section uses `excludeSocialReferences(refs)` and
 * the right-column Social Links section passes the raw refs straight to
 * `<SocialLinks>`. No splitting in the mapper.
 */
export const mapVcReferences = (references: VirtualContributorModelFull['profile']['references']): ReferenceLink[] =>
  normaliseReferences(
    (references ?? []).map(r => ({
      id: r.id,
      name: r.name,
      uri: r.uri,
      description: r.description ?? null,
    }))
  );

export const mapModelCardSummary = (
  vc: VirtualContributorModelFull | undefined,
  externalLabel: string
): ModelCardSummary => {
  const aiEngine = vc?.modelCard?.aiEngine;
  return {
    aiEngine: {
      name: aiEngine?.isExternal ? externalLabel : (vc?.aiPersona?.engine ?? 'unknown'),
      isExternal: aiEngine?.isExternal ?? false,
      hostingLocation: aiEngine?.hostingLocation ?? '',
      isUsingOpenWeightsModel: aiEngine?.isUsingOpenWeightsModel ?? false,
      canAccessWebWhenAnswering: aiEngine?.canAccessWebWhenAnswering ?? false,
      additionalTechnicalDetails: aiEngine?.additionalTechnicalDetails || null,
    },
    monitoring: {
      isUsageMonitoredByAlkemio: vc?.modelCard?.monitoring?.isUsageMonitoredByAlkemio ?? true,
    },
  };
};

export const mapHostCard = (vc: VirtualContributorModelFull | undefined): CompactContributorCardItem | null => {
  const provider = vc?.provider;
  if (!provider) return null;
  return {
    id: 'host',
    displayName: provider.profile.displayName,
    avatarImageUrl: provider.profile.avatar?.uri ?? null,
    caption: null,
    secondaryCaption: null,
    href: provider.profile.url,
  };
};

export const computeSettingsHref = (
  vc: VirtualContributorModelFull | undefined,
  myPrivileges: AuthorizationPrivilege[] | undefined,
  buildSettingsUrl: (url: string) => string
): string | null => {
  const hasUpdate = myPrivileges?.includes(AuthorizationPrivilege.Update);
  if (!hasUpdate || !vc?.profile?.url) return null;
  return buildSettingsUrl(vc.profile.url);
};
