import { useDefaultInnovationFlowTemplateQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { InnovationFlowType } from '../../../../core/apollo/generated/graphql-schema';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

/**
 * TODO: This is an ugly way to return the default InnovationFlow for a space.
 * In the future that must be a preference or something set that can be consulted on the server
 */
const useDefaultInnovationFlowTemplate = (type: InnovationFlowType) => {
  const { spaceNameId } = useUrlParams();

  const { data, loading } = useDefaultInnovationFlowTemplateQuery({
    variables: {
      spaceNameId: spaceNameId!,
    },
    skip: !spaceNameId,
  });

  const buildResult = (defaultInnovationFlowTemplateId: string) => ({
    defaultInnovationFlowTemplateId,
    loading,
  });

  const templates = (data?.space.templates?.innovationFlowTemplates ?? []).filter(template => template.type === type);
  if (templates.length > 0) {
    // The first that has "default" in its name
    const defaultInnovationFlow = templates.find(template =>
      template.profile.displayName.toLocaleLowerCase().includes('default')
    );
    if (defaultInnovationFlow) {
      return buildResult(defaultInnovationFlow.id);
    } else {
      // Just return the first one
      return buildResult(templates[0].id);
    }
  } else {
    return buildResult('');
  }
};

export default useDefaultInnovationFlowTemplate;
