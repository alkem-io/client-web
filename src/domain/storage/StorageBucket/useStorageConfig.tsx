import {
  useAccountStorageConfigQuery,
  useCalloutPostStorageConfigQuery,
  useCalloutStorageConfigQuery,
  useInnovationHubStorageConfigQuery,
  useInnovationPackStorageConfigQuery,
  useJourneyStorageConfigQuery,
  useOrganizationStorageConfigQuery,
  usePlatformStorageConfigQuery,
  useTemplateStorageConfigQuery,
  useUserStorageConfigQuery,
  useVirtualContributorStorageConfigQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useMemo } from 'react';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export interface StorageConfig {
  storageBucketId: string;
  allowedMimeTypes: string[];
  maxFileSize: number;
  canUpload: boolean;
  temporaryLocation: boolean;
}

type StorageConfigLocation =
  | 'journey'
  | 'user'
  | 'virtualContributor'
  | 'organization'
  | 'callout'
  | 'post'
  | 'template'
  | 'innovationPack'
  | 'innovationHub'
  | 'platform'
  | 'account';

interface UseStorageConfigOptionsBase {
  locationType: StorageConfigLocation;
  skip?: boolean;
}

interface UseStorageConfigOptionsSpace extends UseStorageConfigOptionsBase {
  spaceId: string | undefined;
  locationType: 'journey';
}

interface UseStorageConfigOptionsCallout extends UseStorageConfigOptionsBase {
  calloutId: string;
  locationType: 'callout';
}

interface UseStorageConfigOptionsPost extends UseStorageConfigOptionsBase {
  postId: string | undefined;
  calloutId: string | undefined;
  locationType: 'post';
}

interface UseStorageConfigOptionsTemplate extends UseStorageConfigOptionsBase {
  templateId: string | undefined;
  locationType: 'template';
}

interface UseStorageConfigOptionsUser extends UseStorageConfigOptionsBase {
  userId: string;
  locationType: 'user';
}

interface UseStorageConfigOptionsVirtualContributor extends UseStorageConfigOptionsBase {
  virtualContributorId: string;
  locationType: 'virtualContributor';
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

interface UseStorageConfigOptionsAccount extends UseStorageConfigOptionsBase {
  accountId: string;
  locationType: 'account';
}

export type StorageConfigOptions =
  | UseStorageConfigOptionsSpace
  | UseStorageConfigOptionsUser
  | UseStorageConfigOptionsVirtualContributor
  | UseStorageConfigOptionsOrganization
  | UseStorageConfigOptionsCallout
  | UseStorageConfigOptionsPost
  | UseStorageConfigOptionsTemplate
  | UseStorageConfigOptionsInnovationPack
  | UseStorageConfigOptionsInnovationHub
  | UseStorageConfigOptionsPlatform
  | UseStorageConfigOptionsAccount;

export interface StorageConfigProvided {
  storageConfig: StorageConfig | undefined;
}

const useStorageConfig = ({ locationType, skip, ...options }: StorageConfigOptions): StorageConfigProvided => {
  const journeyOptions = options as UseStorageConfigOptionsSpace;
  const { data: journeyStorageConfigData } = useJourneyStorageConfigQuery({
    variables: {
      spaceId: journeyOptions.spaceId!,
    },
    skip: skip || locationType !== 'journey' || !journeyOptions.spaceId,
  });

  const calloutOptions = options as UseStorageConfigOptionsCallout;
  const { data: calloutStorageConfigData } = useCalloutStorageConfigQuery({
    variables: {
      calloutId: calloutOptions.calloutId,
    },
    skip: skip || locationType !== 'callout',
  });

  const postOptions = options as UseStorageConfigOptionsPost;
  const { data: postStorageConfigData } = useCalloutPostStorageConfigQuery({
    variables: {
      postId: postOptions.postId!, // ensured by skip
      calloutId: postOptions.calloutId!, // ensured by skip
    },
    skip: skip || locationType !== 'post' || !postOptions.postId || !postOptions.calloutId,
  });

  const templateOptions = options as UseStorageConfigOptionsTemplate;
  const { data: templateStorageConfigData } = useTemplateStorageConfigQuery({
    variables: {
      templateId: templateOptions.templateId!,
    },
    skip: skip || locationType !== 'template' || !templateOptions.templateId,
  });

  const userOptions = options as UseStorageConfigOptionsUser;
  const { data: userStorageConfigData } = useUserStorageConfigQuery({
    variables: userOptions,
    skip: skip || locationType !== 'user',
  });

  const virtualContributorOptions = options as UseStorageConfigOptionsVirtualContributor;
  const { data: virtualContributorStorageConfigData } = useVirtualContributorStorageConfigQuery({
    variables: virtualContributorOptions,
    skip: skip || locationType !== 'virtualContributor',
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

  const accountOptions = options as UseStorageConfigOptionsAccount;
  const { data: accountContributorStorageConfigData } = useAccountStorageConfigQuery({
    variables: accountOptions,
    skip: skip || locationType !== 'account',
  });

  const journey = journeyStorageConfigData?.lookup.space;

  const callout = calloutStorageConfigData?.lookup.callout;

  const [contribution] = postStorageConfigData?.lookup.callout?.contributions ?? [];

  const { profile } =
    journey ??
    callout?.framing ??
    contribution?.post ??
    templateStorageConfigData?.lookup.template ??
    userStorageConfigData?.user ??
    virtualContributorStorageConfigData?.virtualContributor ??
    organizationStorageConfigData?.organization ??
    innovationPackStorageConfigData?.lookup.innovationPack ??
    innovationHubStorageConfigData?.platform.innovationHub ??
    {};

  const storageConfig =
    profile?.storageBucket ??
    accountContributorStorageConfigData?.account?.storageAggregator.directStorageBucket ??
    platformStorageConfigData?.platform.storageAggregator.directStorageBucket;

  return useMemo(
    () => ({
      storageConfig: storageConfig
        ? {
            storageBucketId: storageConfig.id,
            allowedMimeTypes: storageConfig.allowedMimeTypes,
            maxFileSize: storageConfig.maxFileSize,
            canUpload: (storageConfig?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.FileUpload),
            temporaryLocation: false, // Here should be false by default. Change it to true only on the components that need it.
          }
        : undefined,
    }),
    [storageConfig]
  );
};

export default useStorageConfig;
