import { JourneyLocation } from '../../../../common/utils/urlBuilders';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import {
  useCalloutAspectStorageConfigQuery,
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

type StorageConfigLocation = 'journey' | 'user' | 'organization' | 'callout' | 'aspect' | 'innovationPack';

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

interface UseStorageConfigOptionsAspect extends UseStorageConfigOptionsBase, JourneyLocation {
  aspectId: string | undefined;
  calloutId: string;
  journeyTypeName: JourneyTypeName;
  locationType: 'aspect';
}

interface UseStorageConfigOptionsUser extends UseStorageConfigOptionsBase {
  userId: string;
  locationType: 'user';
}

interface UseStorageConfigOptionsOrganization extends UseStorageConfigOptionsBase {
  organizationId: string;
  locationType: 'organization';
}

interface UseStorageConfigOptionsInnovationPack extends UseStorageConfigOptionsBase {
  innovationPackId: string;
  locationType: 'innovationPack';
}

export type StorageConfigOptions =
  | UseStorageConfigOptionsJourney
  | UseStorageConfigOptionsUser
  | UseStorageConfigOptionsOrganization
  | UseStorageConfigOptionsCallout
  | UseStorageConfigOptionsAspect
  | UseStorageConfigOptionsInnovationPack;

export interface StorageConfigProvided {
  storageConfig: StorageConfig | undefined;
}

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
    skip: locationType !== 'journey',
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
    skip: locationType !== 'callout',
  });

  const aspectOptions = options as UseStorageConfigOptionsAspect;
  const { data: aspectStorageConfigData } = useCalloutAspectStorageConfigQuery({
    variables: {
      aspectId: aspectOptions.aspectId!, // ensured by skip
      calloutId: aspectOptions.calloutId,
      hubNameId: aspectOptions.hubNameId,
      challengeNameId: aspectOptions.challengeNameId,
      opportunityNameId: aspectOptions.opportunityNameId,
      includeHub: journeyTypeName === 'hub',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: locationType !== 'aspect' || !aspectOptions.aspectId,
  });

  const userOptions = options as UseStorageConfigOptionsUser;
  const { data: userStorageConfigData } = useUserStorageConfigQuery({
    variables: userOptions,
    skip: locationType !== 'user',
  });

  const organizationOptions = options as UseStorageConfigOptionsOrganization;
  const { data: organizationStorageConfigData } = useOrganizationStorageConfigQuery({
    variables: organizationOptions,
    skip: locationType !== 'organization',
  });

  const innovationPackOptions = options as UseStorageConfigOptionsInnovationPack;
  const { data: innovationPackStorageConfigData } = useInnovationPackStorageConfigQuery({
    variables: innovationPackOptions,
    skip: locationType !== 'innovationPack',
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

  const [aspect] =
    (
      aspectStorageConfigData?.hub.opportunity?.collaboration ??
      aspectStorageConfigData?.hub.challenge?.collaboration ??
      aspectStorageConfigData?.hub.collaboration
    )?.callouts?.[0]?.aspects ?? [];

  const { profile } =
    journey ??
    callout ??
    aspect ??
    userStorageConfigData?.user ??
    organizationStorageConfigData?.organization ??
    innovationPackStorageConfigData?.platform.library.innovationPack ??
    {};

  const storageConfig = profile?.storageBucket;

  return useMemo(() => ({ storageConfig }), [storageConfig]);
};

export default useStorageConfig;
