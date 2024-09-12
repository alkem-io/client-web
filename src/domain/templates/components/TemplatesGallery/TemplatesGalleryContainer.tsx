import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import useBackToParentPage from '../../../../core/routing/deprecated/useBackToParentPage';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { AnyTemplate } from '../../models/TemplateBase';

interface TemplatesGalleryContainerProvided {
  templates: AnyTemplate[] | undefined;
  templatesCount: number;
  loading?: boolean;
  buildTemplateLink: (template: AnyTemplate) => LinkWithState | undefined;
}

interface TemplatesGalleryContainerProps extends SimpleContainerProps<TemplatesGalleryContainerProvided> {
  templates: AnyTemplate[] | undefined;
  baseUrl: string; // Url to go back after closing dialogs: InnovationPack settings url or Space settings url.
  loading?: boolean;
}

const TemplatesGalleryContainer = ({ templates, baseUrl, loading, children }: TemplatesGalleryContainerProps) => {
  const [, buildLink] = useBackToParentPage(baseUrl);
  const buildTemplateLink = (template: AnyTemplate) => {
    if (template.profile.url) {
      return buildLink(template.profile.url);
    }
  };
  const provided = {
    templates,
    templatesCount: templates?.length ?? 0,
    loading,
    buildTemplateLink,
  };
  return <>{children(provided)}</>;
};

export default TemplatesGalleryContainer;
