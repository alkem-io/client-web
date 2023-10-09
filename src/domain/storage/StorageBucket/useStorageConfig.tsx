import { JourneyLocation } from '../../../main/routing/urlBuilders';
import { JourneyTypeName } from '../../journey/JourneyTypeName';
import {
  useCalloutPostStorageConfigQuery,
  useCalloutStorageConfigQuery,
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

type StorageConfigLocation = 'journey' | 'user' | 'organization' | 'callout' | 'post' | 'innovationPack' | 'platform';

interface UseStorageConfigOptionsBase {
  locationType: StorageConfigLocation;
  skip?: boolean;
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
  | UseStorageConfigOptionsPlatform;

export interface StorageConfigProvided {
  storageConfig: StorageConfig | undefined;
}

const requiredIds: Record<JourneyTypeName, (keyof JourneyLocation)[]> = {
  space: ['spaceNameId'],
  challenge: ['spaceNameId', 'challengeNameId'],
  opportunity: ['spaceNameId', 'opportunityNameId'],
};

const isEveryJourneyIdPresent = (journeyLocation: JourneyLocation, journeyTypeName: JourneyTypeName | undefined) => {
  return journeyTypeName && requiredIds[journeyTypeName].every(idAttr => journeyLocation[idAttr]);
};

const useStorageConfig = ({ locationType, skip, ...options }: StorageConfigOptions): StorageConfigProvided => {
  const journeyTypeName = 'journeyTypeName' in options ? options.journeyTypeName : undefined;

  const journeyOptions = options as UseStorageConfigOptionsJourney;
  const { data: journeyStorageConfigData } = useJourneyStorageConfigQuery({
    variables: {
      spaceNameId: journeyOptions.spaceNameId,
      challengeNameId: journeyOptions.challengeNameId,
      opportunityNameId: journeyOptions.opportunityNameId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: skip || locationType !== 'journey' || !isEveryJourneyIdPresent(journeyOptions, journeyTypeName),
  });

  const calloutOptions = options as UseStorageConfigOptionsCallout;
  const { data: calloutStorageConfigData } = useCalloutStorageConfigQuery({
    variables: {
      calloutId: calloutOptions.calloutId,
      spaceNameId: calloutOptions.spaceNameId,
      challengeNameId: calloutOptions.challengeNameId,
      opportunityNameId: calloutOptions.opportunityNameId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: skip || locationType !== 'callout' || !isEveryJourneyIdPresent(journeyOptions, journeyTypeName),
  });

  const postOptions = options as UseStorageConfigOptionsPost;
  const { data: postStorageConfigData } = useCalloutPostStorageConfigQuery({
    variables: {
      postId: postOptions.postId!, // ensured by skip
      calloutId: postOptions.calloutId,
      spaceNameId: postOptions.spaceNameId,
      challengeNameId: postOptions.challengeNameId,
      opportunityNameId: postOptions.opportunityNameId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip:
      skip ||
      locationType !== 'post' ||
      !postOptions.postId ||
      !isEveryJourneyIdPresent(journeyOptions, journeyTypeName),
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

  const { data: platformStorageConfigData } = usePlatformStorageConfigQuery({
    skip: skip || locationType !== 'platform',
  });

  const journey =
    journeyStorageConfigData?.space.opportunity ??
    journeyStorageConfigData?.space.challenge ??
    journeyStorageConfigData?.space;

  const [callout] =
    (
      calloutStorageConfigData?.space.opportunity?.collaboration ??
      calloutStorageConfigData?.space.challenge?.collaboration ??
      calloutStorageConfigData?.space.collaboration
    )?.callouts ?? [];

  const [contribution] =
    (
      postStorageConfigData?.space.opportunity?.collaboration ??
      postStorageConfigData?.space.challenge?.collaboration ??
      postStorageConfigData?.space.collaboration
    )?.callouts?.[0]?.contributions ?? [];

  const { profile } =
    journey ??
    callout?.framing ??
    contribution.post ??
    userStorageConfigData?.user ??
    organizationStorageConfigData?.organization ??
    innovationPackStorageConfigData?.platform.library.innovationPack ??
    {};

  const storageConfig = profile?.storageBucket ?? platformStorageConfigData?.platform.storageBucket;

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
