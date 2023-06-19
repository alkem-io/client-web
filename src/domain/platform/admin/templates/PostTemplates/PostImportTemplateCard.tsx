import React from 'react';
import { TemplateImportCardComponentProps } from '../InnovationPacks/ImportTemplatesDialogGalleryStep';
import { TemplateInnovationPackMetaInfo } from '../InnovationPacks/InnovationPack';
import PostTemplateCard from '../../../../collaboration/post/PostTemplateCard/PostTemplateCard';

interface PostImportTemplateCardProps extends TemplateImportCardComponentProps<TemplateInnovationPackMetaInfo> {}

const PostImportTemplateCard = ({ template, onClick }: PostImportTemplateCardProps) => {
  return (
    <PostTemplateCard
      template={{
        displayName: template.profile.displayName,
        description: template.profile.description,
        tags: template.profile.tagset?.tags,
        provider: {
          displayName: template.provider?.profile.displayName,
          avatarUri: template.provider?.profile.avatar?.uri,
        },
        innovationPack: {
          id: template.innovationPackId,
          displayName: template.innovationPackProfile.displayName,
        },
      }}
      onClick={onClick}
    />
  );
};

export default PostImportTemplateCard;
