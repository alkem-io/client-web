// TODO: Implement template creation from createInput service
// import { t } from 'xstate';
// import { CreateTemplateMutationVariables, TemplateType } from '@/core/apollo/generated/graphql-schema';
// import { AnyTemplate } from '../models/TemplateBase';
// import { useCreateCalloutInputLazyQuery } from '@/core/apollo/generated/apollo-hooks';
// import { CalloutTemplate } from '../models/CalloutTemplate';

// interface UseCreateInputFromTemplateProps {

// }

// interface UseCreateInputFromTemplateReturn {
//   getCreateTemplateVariables: (template: AnyTemplate) => Promise<CreateTemplateMutationVariables>;

// }

// // The hook itself
// function useCreateInputFromTemplate({ }: UseCreateInputFromTemplateProps) {
//   const [getCreateCallout] = useCreateCalloutInputLazyQuery();

//   const getCreateEntityFromTemplateVariables = async (template: AnyTemplate) => {
//     switch (template.type) {
//       case TemplateType.Callout: {
//         const calloutId = (template as CalloutTemplate).callout?.id;
//         if (calloutId) {
//           const { data } = await getCreateCallout({
//             variables: {
//               calloutId
//             }
//           });
//           const calloutData = data?.inputCreator.callout;

//         }
//         // ...
//       }
//     }
//   }

//   const getCreateTemplateFromTemplateVariables = async (template: AnyTemplate) => {

//   }

//   return { getCreateEntityFromTemplateVariables, getCreateTemplateFromTemplateVariables };
// }

// export default useCreateInputFromTemplate;
