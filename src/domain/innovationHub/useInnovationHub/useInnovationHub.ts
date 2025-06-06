import { useInnovationHubQuery } from '@/core/apollo/generated/apollo-hooks';
import { useQueryParams } from '@/core/routing/useQueryParams';
import useInnovationHubAttrs from '../InnovationHubHomePage/InnovationHubAttrs';

const useInnovationHub = () => {
  const params = useQueryParams();

  const subdomain = import.meta.env.MODE === 'development' ? params.get('subdomain') ?? undefined : undefined;

  // Subdomain can come from a query url param or from the current domain (server will handle, so we can send subdomain=undefined)
  const { data: innovationHubData, loading: innovationHubLoading } = useInnovationHubQuery({
    variables: {
      subdomain,
    },
  });

  const innovationHub = useInnovationHubAttrs(innovationHubData?.platform.innovationHub);

  return {
    innovationHub,
    innovationHubLoading,
  };
};

export default useInnovationHub;
