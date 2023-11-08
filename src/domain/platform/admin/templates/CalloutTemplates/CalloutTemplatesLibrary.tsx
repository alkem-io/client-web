// import { compact } from 'lodash';
// import { ComponentType, FC, useMemo, useState } from 'react';
// import { useTranslation } from 'react-i18next';

// export interface PostTemplatesLibraryProps {
//   onSelectTemplate: (template: PostTemplateWithValue) => void;
// }

// const applyFilter = <T extends TemplateWithInnovationPack<PostTemplate>>(
//   filter: string[],
//   templates: T[] | undefined
// ) => {
//   if (filter.length === 0) {
//     return templates;
//   }
//   return templates?.filter(post => {
//     const postString =
//       `${post.profile.displayName} ${post.innovationPack?.provider?.profile.displayName} ${post.innovationPack?.profile.displayName}`.toLowerCase();
//     return filter.some(term => postString.includes(term.toLowerCase()));
//   });
// };

// const CalloutTemplatesLibrary: FC<PostTemplatesLibraryProps> = ({ onSelectTemplate }) => {
//   const { t } = useTranslation();
//   const { spaceNameId } = useUrlParams();
//   const [filter, setFilter] = useState<string[]>([]);

//   // Space Templates:
//   const [fetchTemplatesFromSpace, { data: spaceData, loading: loadingTemplatesFromSpace }] =
//     useSpacePostTemplatesLibraryLazyQuery({
//       variables: {
//         spaceId: spaceNameId!,
//       },
//     });

//   const templatesFromSpace = useMemo(
//     () =>
//       applyFilter(
//         filter,
//         spaceData?.space.templates?.postTemplates.map(template => ({
//           ...template,
//           innovationPack: {
//             profile: { displayName: '' },
//             provider: spaceData?.space.host,
//           },
//         }))
//       ),
//     [spaceData, filter]
//   );

//   // Platform Templates:
//   const [fetchPlatformTemplates, { data: platformData, loading: loadingTemplatesFromPlatform }] =
//     usePlatformPostTemplatesLibraryLazyQuery();

//   const templatesFromPlatform = useMemo(
//     () =>
//       applyFilter(
//         filter,
//         platformData?.platform.library.innovationPacks.flatMap(ip =>
//           compact(
//             ip.templates?.postTemplates.map(template => ({
//               ...template,
//               innovationPack: ip,
//             }))
//           )
//         )
//       ),
//     [platformData]
//   );

//   // Post templates include the value (defaultDescription and type), so no need to go to the server and fetch like with Whiteboards
//   const getPostTemplateContent = (
//     template: PostTemplate & Identifiable
//   ): Promise<PostTemplateWithValue & Identifiable> => {
//     return Promise.resolve(template);
//   };

//   return (
//     <CollaborationTemplatesLibrary
//       dialogTitle={t('templateLibrary.postTemplates.title')}
//       onSelectTemplate={onSelectTemplate}
//       templateCardComponent={PostTemplateCard as ComponentType<TemplateCardBaseProps<PostTemplate>>}
//       templatePreviewComponent={PostTemplatePreview}
//       filter={filter}
//       onFilterChange={setFilter}
//       fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
//       fetchTemplatesFromSpace={fetchTemplatesFromSpace}
//       templatesFromSpace={templatesFromSpace}
//       loadingTemplatesFromSpace={loadingTemplatesFromSpace}
//       getTemplateWithContent={getPostTemplateContent}
//       fetchTemplatesFromPlatform={fetchPlatformTemplates}
//       templatesFromPlatform={templatesFromPlatform}
//       loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
//     />
//   );
// };

// export default CalloutTemplatesLibrary;
