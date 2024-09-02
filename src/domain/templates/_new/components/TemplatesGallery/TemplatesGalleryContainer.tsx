import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import { SimpleContainerProps } from '../../../../../core/container/SimpleContainer';
import useBackToParentPage from '../../../../../core/routing/deprecated/useBackToParentPage';
import { RoutePaths } from '../../../../InnovationPack/admin/AdminInnovationPackPage';
import { LinkWithState } from '../../../../shared/types/LinkWithState';
import { AnyTemplate } from '../../models/TemplateBase';

interface TemplatesGalleryContainerProvided {
  templates: AnyTemplate[] | undefined;
  loading?: boolean;
  buildTemplateLink: (template: AnyTemplate) => LinkWithState;

}

interface TemplatesGalleryContainerProps extends SimpleContainerProps<TemplatesGalleryContainerProvided> {
  templates: AnyTemplate[] | undefined;
  templatesSetId: string | undefined;
  baseUrl: string;  // Url to go back after closing dialogs: InnovationPack settings url or Space settings url.
}

const TemplatesGalleryContainer = ({ templates, templatesSetId, baseUrl, children }: TemplatesGalleryContainerProps) => {
  const [, buildLink] = useBackToParentPage(baseUrl);
  const buildTemplateLink = (template: AnyTemplate) => {

    switch (template.type) {
      case TemplateType.Callout:
        return buildLink(`${baseUrl}/${RoutePaths.postTemplatesRoutePath}/${template.id}`);
      case TemplateType.CommunityGuidelines:
        return buildLink(`${baseUrl}/${RoutePaths.communityGuidelinesTemplatesRoutePath}/${template.id}`);
      case TemplateType.InnovationFlow:
        return buildLink(`${baseUrl}/${RoutePaths.innovationTemplatesRoutePath}/${template.id}`);
      case TemplateType.Post: {
        const link = buildLink(`${baseUrl}/${RoutePaths.postTemplatesRoutePath}/${template.id}`);
        console.log('template', template, link);
        return link;
      }
      case TemplateType.Whiteboard:
        return buildLink(`${baseUrl}/${RoutePaths.whiteboardTemplatesRoutePath}/${template.id}`);
    }
  }
  const provided = {
    templates,
    loading: false,
    buildTemplateLink,
  }
  return <>{children(provided)}</>;
};

export default TemplatesGalleryContainer;