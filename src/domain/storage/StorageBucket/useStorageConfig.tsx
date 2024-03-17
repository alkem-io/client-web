import { JourneyTypeName } from '../../journey/JourneyTypeName';
import {
  useCalloutPostStorageConfigQuery,
  useCalloutStorageConfigQuery,
  useInnovationHubStorageConfigQuery,
  useInnovationPackStorageConfigQuery,
  useJourneyStorageConfigQuery,
  useOrganizationStorageConfigQuery,
  usePlatformStorageConfigQuery,
  useUserStorageConfigQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { useMemo } from 'react';
import { AuthorizationPrivilege } from '../../../core/apollo/generated/graphql-schema';

export interface StorageConfig {
  storageBucketId: string;
  allowedMimeTypes: string[];
  maxFileSize: number;
  canUpload: boolean;
}

type StorageConfigLocation =
  | 'journey'
  | 'user'
  | 'organization'
  | 'callout'
  | 'post'
  | 'innovationPack'
  | 'innovationHub'
  | 'platform';

interface UseStorageConfigOptionsBase {
  locationType: StorageConfigLocation;
  skip?: boolean;
}

interface UseStorageConfigOptionsJourney extends UseStorageConfigOptionsBase {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
  locationType: 'journey';
}

interface UseStorageConfigOptionsCallout extends UseStorageConfigOptionsBase {
  calloutId: string;
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
  locationType: 'callout';
}

interface UseStorageConfigOptionsPost extends UseStorageConfigOptionsBase {
  postId: string | undefined;
  calloutId: string;
  journeyId: string | undefined;
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

interface UseStorageConfigOptionsInnovationHub extends UseStorageConfigOptionsBase {
  innovationHubId: string | undefined;
  locationType: 'innovationHub';
}

interface UseStorageConfigOptionsPlatform extends UseStorageConfigOptionsBase {
  locationType: 'platform';
}

export type StorageConfigOptions =
  | UseStorageConfigOptionsJourney
  | UseStorageConfigOptionsUser
  | UseStorageConfigOptionsOrganization
  | UseStorageConfigOptionsCallout
  | UseStorageConfigOptionsPost
  | UseStorageConfigOptionsInnovationPack
  | UseStorageConfigOptionsInnovationHub
  | UseStorageConfigOptionsPlatform;

export interface StorageConfigProvided {
  storageConfig: StorageConfig | undefined;
}

const useStorageConfig = ({ locationType, skip, ...options }: StorageConfigOptions): StorageConfigProvided => {
  const journeyTypeName = 'journeyTypeName' in options ? options.journeyTypeName : undefined;

  const journeyOptions = options as UseStorageConfigOptionsJourney;
  const { data: journeyStorageConfigData } = useJourneyStorageConfigQuery({
    variables: {
      spaceId: journeyOptions.journeyId,
      challengeId: journeyOptions.journeyId,
      opportunityId: journeyOptions.journeyId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: skip || locationType !== 'journey' || !journeyOptions.journeyId,
  });

  const calloutOptions = options as UseStorageConfigOptionsCallout;

  const { data: calloutStorageConfigData } = useCalloutStorageConfigQuery({
    variables: {
      calloutId: calloutOptions.calloutId,
      spaceId: journeyOptions.journeyId,
      challengeId: journeyOptions.journeyId,
      opportunityId: journeyOptions.journeyId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: skip || locationType !== 'callout' || !journeyOptions.journeyId,
  });

  const postOptions = options as UseStorageConfigOptionsPost;
  const { data: postStorageConfigData } = useCalloutPostStorageConfigQuery({
    variables: {
      postId: postOptions.postId!, // ensured by skip
      calloutId: postOptions.calloutId,
      spaceId: journeyOptions.journeyId,
      challengeId: journeyOptions.journeyId,
      opportunityId: journeyOptions.journeyId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: skip || locationType !== 'post' || !postOptions.postId || !journeyOptions.journeyId,
  });

  const userOptions = options as UseStorageConfigOptionsUser;
  const { data: userStorageConfigData } = useUserStorageConfigQuery({
    variables: userOptions,
    skip: skip || locationType !== 'user',
  });

  const organizationOptions = options as UseStorageConfigOptionsOrganization;
  const { data: organizationStorageConfigData } = useOrganizationStorageConfigQuery({
    variables: {
      organizationId: organizationOptions.organizationId!, // presence ensured by skip
    },
    skip: skip || locationType !== 'organization' || !organizationOptions.organizationId,
  });

  const innovationPackOptions = options as UseStorageConfigOptionsInnovationPack;
  const { data: innovationPackStorageConfigData } = useInnovationPackStorageConfigQuery({
    variables: {
      innovationPackId: innovationPackOptions.innovationPackId!, // presence ensured by skip
    },
    skip: skip || locationType !== 'innovationPack' || !innovationPackOptions.innovationPackId,
  });

  const innovationHubOptions = options as UseStorageConfigOptionsInnovationHub;
  const { data: innovationHubStorageConfigData } = useInnovationHubStorageConfigQuery({
    variables: {
      innovationHubId: innovationHubOptions.innovationHubId!, // presence ensured by skip
    },
    skip: skip || locationType !== 'innovationHub' || !innovationHubOptions.innovationHubId,
  });

  const { data: platformStorageConfigData } = usePlatformStorageConfigQuery({
    skip: skip || locationType !== 'platform',
  });

  const journey =
    journeyStorageConfigData?.lookup.opportunity ??
    journeyStorageConfigData?.lookup.challenge ??
    journeyStorageConfigData?.space;

  const [callout] =
    (
      calloutStorageConfigData?.lookup.opportunity?.collaboration ??
      calloutStorageConfigData?.lookup.challenge?.collaboration ??
      calloutStorageConfigData?.space?.collaboration
    )?.callouts ?? [];

  const [contribution] =
    (
      postStorageConfigData?.lookup.opportunity?.collaboration ??
      postStorageConfigData?.lookup.challenge?.collaboration ??
      postStorageConfigData?.space?.collaboration
    )?.callouts?.[0]?.contributions ?? [];

  const { profile } =
    journey ??
    callout?.framing ??
    contribution?.post ??
    userStorageConfigData?.user ??
    organizationStorageConfigData?.organization ??
    innovationPackStorageConfigData?.platform.library.innovationPack ??
    innovationHubStorageConfigData?.platform.innovationHub ??
    {};

  const storageConfig =
    profile?.storageBucket ?? platformStorageConfigData?.platform.storageAggregator.directStorageBucket;

  return useMemo(
    () => ({
      storageConfig: storageConfig
        ? {
            storageBucketId: storageConfig.id,
            allowedMimeTypes: storageConfig.allowedMimeTypes,
            maxFileSize: storageConfig.maxFileSize,
            canUpload: (storageConfig?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.FileUpload),
          }
        : undefined,
    }),
    [storageConfig]
  );
};

export default useStorageConfig;
