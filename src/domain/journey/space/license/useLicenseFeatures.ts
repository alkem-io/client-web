import { License } from '../../../../core/apollo/generated/graphql-schema';
import { LicenseFeature } from './LicenseFeature';

export const licenseHasFeature = (feature: LicenseFeature, license: License) =>
  license.featureFlags.find(featureFlag => featureFlag.name === feature)?.enabled ?? false;

const useLicenseFeatures = (license: License) => {
  return {
    licenseHasFeature: (feature: LicenseFeature) => licenseHasFeature(feature, license),
  };
};

export default useLicenseFeatures;
