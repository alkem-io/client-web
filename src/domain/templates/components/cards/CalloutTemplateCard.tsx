import { FC } from 'react';
import { Box } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import stopPropagationFromLinks from '@/core/ui/utils/stopPropagationFromLinks';
import { CalloutTemplate } from '@/domain/templates/models/CalloutTemplate';
import { TemplateCardProps } from './TemplateCard';
import TemplateCardLayout from './TemplateCardLayout';

interface CalloutTemplateCardProps extends TemplateCardProps {
  template: CalloutTemplate;
}

const CalloutTemplateCard: FC<CalloutTemplateCardProps> = ({
  template,
  innovationPack,
  loading,
  isSelected,
  ...props
}) => {
  return (
    <TemplateCardLayout
      templateName={template?.profile.displayName}
      innovationPack={innovationPack}
      tags={template?.profile.defaultTagset?.tags ?? []}
      loading={loading}
      isSelected={isSelected}
      {...props}
    >
      <Box paddingX={1.5} paddingY={1} onClick={stopPropagationFromLinks}>
        <WrapperMarkdown>{template?.profile.description ?? ''}</WrapperMarkdown>
      </Box>
    </TemplateCardLayout>
  );
};

export default CalloutTemplateCard;
