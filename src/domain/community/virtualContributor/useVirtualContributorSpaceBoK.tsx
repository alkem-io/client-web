import {
  useSpaceBodyOfKnowledgeAboutLazyQuery,
  useSpaceBodyOfKnowledgeAuthorizationPrivilegesLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

const useVirtualContributorSpaceBoK = () => {
  // Fetch community virtual members list

  const [getVcSpaceBoKAuth, { loading: bokProfileAuthLoading }] =
    useSpaceBodyOfKnowledgeAuthorizationPrivilegesLazyQuery();
  const [getVcBoKProfile, { loading: bokProfileLoading }] = useSpaceBodyOfKnowledgeAboutLazyQuery();
  const getBoKProfile = async (bodyOfKnowledgeID: string) => {
    const { data: authData } = await getVcSpaceBoKAuth({
      variables: {
        spaceId: bodyOfKnowledgeID!,
      },
    });

    if (!authData?.lookup.myPrivileges?.space?.includes(AuthorizationPrivilege.ReadAbout)) {
      return;
    }

    const { data } = await getVcBoKProfile({
      variables: {
        spaceId: bodyOfKnowledgeID!,
      },
    });

    return data?.lookup?.space?.about.profile;
  };

  return {
    getBoKProfile,
    bokProfileLoading: bokProfileAuthLoading || bokProfileLoading,
  };
};

export default useVirtualContributorSpaceBoK;
