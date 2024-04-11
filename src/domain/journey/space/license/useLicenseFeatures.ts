import { LicenseFeatureFlagName } from '../../../../core/apollo/generated/graphql-schema';

interface License {
  featureFlags:
    | {
        name: LicenseFeatureFlagName;
        enabled: boolean;
      }[]
    | undefined;
}

export const licenseHasFeature = (feature: LicenseFeatureFlagName, license: License | undefined) =>
  license?.featureFlags?.find(featureFlag => featureFlag.name === feature)?.enabled ?? false;

const useLicenseFeatures = (license: License | undefined) => {
  return {
    licenseHasFeature: (feature: LicenseFeatureFlagName) => licenseHasFeature(feature, license),
  };
};

export default useLicenseFeatures;
