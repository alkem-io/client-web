import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import PostTemplateCard from '../../../../templates/cards/PostTemplateCard/PostTemplateCard';

interface PostImportTemplateCardProps extends TemplateImportCardComponentProps {}

const PostImportTemplateCard = ({ template, ...props }: PostImportTemplateCardProps) => {
  return <PostTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default PostImportTemplateCard;
