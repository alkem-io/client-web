import { t } from 'xstate';
import { CreateTemplateMutationVariables, TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import { AnyTemplate } from '../../../models/TemplateBase';

interface UseCreateInputFromTemplateProps {

}

interface UseCreateInputFromTemplateReturn {
  //getCreateTemplateVariables(template: AnyTemplate) => Promise<CreateTemplateMutationVariables>;

}

// The hook itself
function useCreateInputFromTemplate({ }: UseCreateInputFromTemplateProps) {

  // const getCreateTemplateVariables = (template: AnyTemplate) => {
  //   switch (template.type) {
  //     case TemplateType.Callout: {

  //     }
  //   }
  // }

  // return { getCreateTemplateVariables };
}

export default useCreateInputFromTemplate;