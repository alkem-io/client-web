import { useDefaultInnovationFlowTemplateQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { InnovationFlowType } from '../../../../core/apollo/generated/graphql-schema';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

/**
 * TODO: This is an ugly way to return the default InnovationFlow for a space.
 * In the future that must be a preference or something set that can be consulted on the server
 * For now we are just returning the first innovationFlow returned by the server
 */
const useDefaultInnovationFlowTemplate = (type: InnovationFlowType) => {
  const { spaceNameId } = useUrlParams();

  const { data, loading } = useDefaultInnovationFlowTemplateQuery({
    variables: {
      spaceNameId: spaceNameId!,
    },
    skip: !spaceNameId,
  });

  const templates = (data?.space.templates?.innovationFlowTemplates ?? []).filter(template => template.type === type);
  if (templates.length > 0) {
    return {
      defaultInnovationFlowTemplateId: templates[0].id,
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
