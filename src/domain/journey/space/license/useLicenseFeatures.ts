import { License, LicenseFeatureFlagName } from '../../../../core/apollo/generated/graphql-schema';

export const licenseHasFeature = (feature: LicenseFeatureFlagName, license: License) =>
  license.featureFlags.find(featureFlag => featureFlag.name === feature)?.enabled ?? false;

const useLicenseFeatures = (license: License) => {
  return {
    licenseHasFeature: (feature: LicenseFeatureFlagName) => licenseHasFeature(feature, license),
  };
};

export default useLicenseFeatures;
