import { useDefaultInnovationFlowTemplateQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

/**
 * TODO: This is an ugly way to return the default InnovationFlow for a space.
 * In the future that must be a preference or something set that can be consulted on the server
 * For now we are just returning the first innovationFlow returned by the server
 */
const useDefaultInnovationFlowTemplate = () => {
  const { spaceNameId } = useUrlParams();

  const { data, loading } = useDefaultInnovationFlowTemplateQuery({
    variables: {
      spaceNameId: spaceNameId!,
    },
    skip: !spaceNameId,
  });

  const template = data?.space.defaults?.innovationFlowTemplate;
  if (template) {
    return {
      defaultInnovationFlowTemplateId: template.id,
      loading,
    };
  } else {
    return {
      defaultInnovationFlowTemplateId: undefined,
      loading,
    };
  }
};

export default useDefaultInnovationFlowTemplate;
