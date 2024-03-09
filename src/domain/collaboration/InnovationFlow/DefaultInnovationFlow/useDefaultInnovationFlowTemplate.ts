import { useDefaultInnovationFlowTemplateQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

const useDefaultInnovationFlowTemplate = () => {
  const { spaceNameId } = useUrlParams();

  const { data, loading } = useDefaultInnovationFlowTemplateQuery({
    variables: {
      spaceNameId: spaceNameId!,
    },
    skip: !spaceNameId,
  });

  return {
    defaultInnovationFlowTemplateId: data?.space.account.defaults?.innovationFlowTemplate?.id,
    loading,
  };
};

export default useDefaultInnovationFlowTemplate;
