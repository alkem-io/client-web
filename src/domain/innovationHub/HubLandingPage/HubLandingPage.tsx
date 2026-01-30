import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useInnovationHubByIdQuery } from '@/core/apollo/generated/apollo-hooks';
import useInnovationHubAttrs from '../InnovationHubHomePage/InnovationHubAttrs';
import InnovationHubHomePage from '../InnovationHubHomePage/InnovationHubHomePage';
import Loading from '@/core/ui/loading/Loading';

const HubLandingPage = () => {
  const { innovationHubId, loading: resolverLoading } = useUrlResolver();

  const { data, loading: hubLoading } = useInnovationHubByIdQuery({
    variables: { id: innovationHubId! },
    skip: !innovationHubId,
  });

  const innovationHub = useInnovationHubAttrs(data?.platform.innovationHub);

  if (resolverLoading || hubLoading || !innovationHub) {
    return <Loading />;
  }

  return <InnovationHubHomePage innovationHub={innovationHub} />;
};

export default HubLandingPage;
