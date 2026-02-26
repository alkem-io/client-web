import { FC } from 'react';
import { Box } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import stopPropagationFromLinks from '@/core/ui/utils/stopPropagationFromLinks';
import { TemplateCardProps } from './TemplateCard';
import { CommunityGuidelinesTemplate } from '@/domain/templates/models/CommunityGuidelinesTemplate';
import TemplateCardLayout from './TemplateCardLayout';

interface CommunityGuidelinesTemplateCardProps extends TemplateCardProps {
  template: CommunityGuidelinesTemplate;
}

const CommunityGuidelinesTemplateCard: FC<CommunityGuidelinesTemplateCardProps> = ({
  template,
  innovationPack,
  loading,
  ...props
}) => {
  return (
    <TemplateCardLayout
      templateName={template?.profile.displayName}
      innovationPack={innovationPack}
      tags={template?.profile.defaultTagset?.tags ?? []}
      loading={loading}
      {...props}
    >
      <Box paddingX={1.5} paddingY={1} onClick={stopPropagationFromLinks}>
        <WrapperMarkdown>{template?.profile.description ?? ''}</WrapperMarkdown>
      </Box>
    </TemplateCardLayout>
  );
};

export default CommunityGuidelinesTemplateCard;
