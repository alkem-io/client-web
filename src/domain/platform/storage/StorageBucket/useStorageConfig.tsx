import { JourneyLocation } from '../../../../common/utils/urlBuilders';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import {
  useCalloutPostStorageConfigQuery,
  useCalloutStorageConfigQuery,
  useInnovationPackStorageConfigQuery,
  useJourneyStorageConfigQuery,
  useOrganizationStorageConfigQuery,
  useUserStorageConfigQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useMemo } from 'react';

export interface StorageConfig {
  allowedMimeTypes: string[];
  maxFileSize: number;
}

type StorageConfigLocation = 'journey' | 'user' | 'organization' | 'callout' | 'post' | 'innovationPack';

interface UseStorageConfigOptionsBase {
  locationType: StorageConfigLocation;
}

interface UseStorageConfigOptionsJourney extends UseStorageConfigOptionsBase, JourneyLocation {
  journeyTypeName: JourneyTypeName;
  locationType: 'journey';
}

interface UseStorageConfigOptionsCallout extends UseStorageConfigOptionsBase, JourneyLocation {
  calloutId: string;
  journeyTypeName: JourneyTypeName;
  locationType: 'callout';
}

interface UseStorageConfigOptionsPost extends UseStorageConfigOptionsBase, JourneyLocation {
  postId: string | undefined;
  calloutId: string;
  journeyTypeName: JourneyTypeName;
  locationType: 'post';
}

interface UseStorageConfigOptionsUser extends UseStorageConfigOptionsBase {
  userId: string;
  locationType: 'user';
}

interface UseStorageConfigOptionsOrganization extends UseStorageConfigOptionsBase {
  organizationId: string | undefined;
  locationType: 'organization';
}

interface UseStorageConfigOptionsInnovationPack extends UseStorageConfigOptionsBase {
  innovationPackId: string | undefined;
  locationType: 'innovationPack';
}

export type StorageConfigOptions =
  | UseStorageConfigOptionsJourney
  | UseStorageConfigOptionsUser
  | UseStorageConfigOptionsOrganization
  | UseStorageConfigOptionsCallout
  | UseStorageConfigOptionsPost
  | UseStorageConfigOptionsInnovationPack;

export interface StorageConfigProvided {
  storageConfig: StorageConfig | undefined;
}

const requiredIds: Record<JourneyTypeName, (keyof JourneyLocation)[]> = {
  hub: ['hubNameId'],
  challenge: ['hubNameId', 'challengeNameId'],
  opportunity: ['hubNameId', 'opportunityNameId'],
};

const isEveryJourneyIdPresent = (journeyLocation: JourneyLocation, journeyTypeName: JourneyTypeName | undefined) => {
  return journeyTypeName && requiredIds[journeyTypeName].every(idAttr => journeyLocation[idAttr]);
};

const useStorageConfig = ({ locationType, ...options }: StorageConfigOptions): StorageConfigProvided => {
  const journeyTypeName = 'journeyTypeName' in options ? options.journeyTypeName : undefined;

  const journeyOptions = options as UseStorageConfigOptionsJourney;
  const { data: journeyStorageConfigData } = useJourneyStorageConfigQuery({
    variables: {
      hubNameId: journeyOptions.hubNameId,
      challengeNameId: journeyOptions.challengeNameId,
      opportunityNameId: journeyOptions.opportunityNameId,
      includeHub: journeyTypeName === 'hub',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: locationType !== 'journey' || !isEveryJourneyIdPresent(journeyOptions, journeyTypeName),
  });

  const calloutOptions = options as UseStorageConfigOptionsCallout;
  const { data: calloutStorageConfigData } = useCalloutStorageConfigQuery({
    variables: {
      calloutId: calloutOptions.calloutId,
      hubNameId: calloutOptions.hubNameId,
      challengeNameId: calloutOptions.challengeNameId,
      opportunityNameId: calloutOptions.opportunityNameId,
      includeHub: journeyTypeName === 'hub',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: locationType !== 'callout' || !isEveryJourneyIdPresent(journeyOptions, journeyTypeName),
  });

  const postOptions = options as UseStorageConfigOptionsPost;
  const { data: postStorageConfigData } = useCalloutPostStorageConfigQuery({
    variables: {
      postId: postOptions.postId!, // ensured by skip
      calloutId: postOptions.calloutId,
      hubNameId: postOptions.hubNameId,
      challengeNameId: postOptions.challengeNameId,
      opportunityNameId: postOptions.opportunityNameId,
      includeHub: journeyTypeName === 'hub',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: locationType !== 'post' || !postOptions.postId || !isEveryJourneyIdPresent(journeyOptions, journeyTypeName),
  });

  const userOptions = options as UseStorageConfigOptionsUser;
  const { data: userStorageConfigData } = useUserStorageConfigQuery({
    variables: userOptions,
    skip: locationType !== 'user',
  });

  const organizationOptions = options as UseStorageConfigOptionsOrganization;
  const { data: organizationStorageConfigData } = useOrganizationStorageConfigQuery({
    variables: {
      organizationId: organizationOptions.organizationId!, // presence ensured by skip
    },
    skip: locationType !== 'organization' || !organizationOptions.organizationId,
  });

  const innovationPackOptions = options as UseStorageConfigOptionsInnovationPack;
  const { data: innovationPackStorageConfigData } = useInnovationPackStorageConfigQuery({
    variables: {
      innovationPackId: innovationPackOptions.innovationPackId!, // presence ensured by skip
    },
    skip: locationType !== 'innovationPack' || !innovationPackOptions.innovationPackId,
  });

  const journey =
    journeyStorageConfigData?.hub.opportunity ??
    journeyStorageConfigData?.hub.challenge ??
    journeyStorageConfigData?.hub;

  const [callout] =
    (
      calloutStorageConfigData?.hub.opportunity?.collaboration ??
      calloutStorageConfigData?.hub.challenge?.collaboration ??
      calloutStorageConfigData?.hub.collaboration
    )?.callouts ?? [];

  const [post] =
    (
      postStorageConfigData?.hub.opportunity?.collaboration ??
      postStorageConfigData?.hub.challenge?.collaboration ??
      postStorageConfigData?.hub.collaboration
    )?.callouts?.[0]?.posts ?? [];

  const { profile } =
    journey ??
    callout ??
    post ??
    userStorageConfigData?.user ??
    organizationStorageConfigData?.organization ??
    innovationPackStorageConfigData?.platform.library.innovationPack ??
    {};

  const storageConfig = profile?.storageBucket;

  return useMemo(() => ({ storageConfig }), [storageConfig]);
};

export default useStorageConfig;
