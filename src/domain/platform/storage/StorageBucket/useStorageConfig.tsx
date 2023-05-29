import { JourneyLocation } from '../../../../common/utils/urlBuilders';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import {
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

type StorageConfigLocation = 'journey' | 'user' | 'organization' | 'callout' | 'innovationPack';

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
  | UseStorageConfigOptionsInnovationPack;

export interface StorageConfigProvided {
  storageConfig: StorageConfig | undefined;
}

const useStorageConfig = ({ locationType, ...options }: StorageConfigOptions): StorageConfigProvided => {
  const journeyOptions = options as UseStorageConfigOptionsJourney;
  const { data: journeyStorageConfigData } = useJourneyStorageConfigQuery({
    variables: {
      hubNameId: journeyOptions.hubNameId,
      challengeNameId: journeyOptions.challengeNameId,
      opportunityNameId: journeyOptions.opportunityNameId,
      includeHub: journeyOptions.journeyTypeName === 'hub',
      includeChallenge: journeyOptions.journeyTypeName === 'challenge',
      includeOpportunity: journeyOptions.journeyTypeName === 'opportunity',
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
      includeHub: journeyOptions.journeyTypeName === 'hub',
      includeChallenge: journeyOptions.journeyTypeName === 'challenge',
      includeOpportunity: journeyOptions.journeyTypeName === 'opportunity',
    },
    skip: locationType !== 'callout',
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

  const { profile } =
    journey ??
    callout ??
    userStorageConfigData?.user ??
    organizationStorageConfigData?.organization ??
    innovationPackStorageConfigData?.platform.library.innovationPack ??
    {};

  const storageConfig = profile?.storageBucket;

  return useMemo(() => ({ storageConfig }), [storageConfig]);
};

export default useStorageConfig;
