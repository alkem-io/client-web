import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tooltip, IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { LONG_MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { PostValues } from './AddContentProps';

interface PostItemProps {
  post: PostValues;
  index: number;
  onDelete: (index: number) => void;
  hasDelete: boolean;
}

export const PostItem = ({ post, index, onDelete, hasDelete }: PostItemProps) => {
  const { t } = useTranslation();

  return (
    <Gutters key={index} paddingX={0}>
      <FormikInputField
        name={`posts[${index}].title`}
        title={t('createVirtualContributorWizard.addContent.post.title')}
        required
        value={post.title}
      />
      <Box display="flex" flexDirection="column">
        <FormikMarkdownField
          name={`posts[${index}].description`}
          title={t('common.post')}
          rows={7}
          maxLength={LONG_MARKDOWN_TEXT_LENGTH}
          hideImageOptions
          value={post.description}
        />
        {hasDelete && (
          <Tooltip title={t('createVirtualContributorWizard.addContent.post.delete')} placement={'bottom'}>
            <IconButton
              onClick={() => onDelete(index)}
              size="large"
              aria-label={t('createVirtualContributorWizard.addContent.post.delete')}
              sx={{ marginTop: gutters(-1), alignSelf: 'flex-end' }}
            >
              <DeleteOutlineIcon color="primary" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Gutters>
  );
};
