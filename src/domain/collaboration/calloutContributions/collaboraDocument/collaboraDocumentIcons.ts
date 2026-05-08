import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import BrushOutlined from '@mui/icons-material/BrushOutlined';
import SlideshowOutlined from '@mui/icons-material/SlideshowOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import type { SvgIconProps } from '@mui/material';
import type { ComponentType } from 'react';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';

const collaboraDocumentIcons: Record<CollaboraDocumentType, ComponentType<SvgIconProps>> = {
  [CollaboraDocumentType.Spreadsheet]: TableChartOutlined,
  [CollaboraDocumentType.Presentation]: SlideshowOutlined,
  [CollaboraDocumentType.Wordprocessing]: ArticleOutlined,
  [CollaboraDocumentType.Drawing]: BrushOutlined,
};

export const getCollaboraDocumentIcon = (type: CollaboraDocumentType): ComponentType<SvgIconProps> => {
  return collaboraDocumentIcons[type] ?? ArticleOutlined;
};

export default collaboraDocumentIcons;
