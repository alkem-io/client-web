import { FeatureFlag } from '../../../../core/apollo/generated/graphql-schema';
import { useSpace } from '../SpaceContext/useSpace';
import { SpaceFeature } from './SpaceLicenseFeatureFlags';

const useSpaceFeatures = () => {
  const spaceFromContext = useSpace();

  const spaceHasFeature = (
    feature: SpaceFeature,
    featureFlags: FeatureFlag[] = spaceFromContext.license.featureFlags
  ) => featureFlags.find(spaceFeature => spaceFeature.name === feature)?.enabled ?? false;

  return {
    spaceHasFeature,
  };
};

export default useSpaceFeatures;
