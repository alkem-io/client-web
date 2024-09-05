import React from 'react';
import { TemplateImportCardComponentProps } from '../../_new/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialogGallery';
import PostTemplateCard from '../../_new/components/cards/PostTemplateCard';

interface PostImportTemplateCardProps extends TemplateImportCardComponentProps {}

const PostImportTemplateCard = ({ template, ...props }: PostImportTemplateCardProps) => {
  return <PostTemplateCard template={template} innovationPack={template.innovationPack} {...props} />;
};

export default PostImportTemplateCard;
