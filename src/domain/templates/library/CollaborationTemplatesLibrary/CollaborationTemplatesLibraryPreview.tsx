import { Avatar, Button, Skeleton, useTheme } from '@mui/material';
import React, { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GridContainer from '../../../../core/ui/grid/GridContainer';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { BlockSectionTitle, CardText } from '../../../../core/ui/typography';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { gutters } from '../../../../core/ui/grid/utils';
import { Actions } from '../../../../core/ui/actions/Actions';
import LinkNoUnderline from '../../../shared/components/LinkNoUnderline';
import { TemplateBase, TemplateCardBaseProps } from './TemplateBase';
import { Visual } from '../../../common/visual/Visual';

export interface CollaborationTemplatesLibraryPreviewProps<Template extends TemplateBase, TemplateValue extends {}> {
  onClose: () => void;
  template?: Template & TemplateValue;
  templateCardComponent: ComponentType<TemplateCardBaseProps<Template>>;
  templatePreviewComponent: ComponentType<{ template?: TemplateValue }>;
  templateInfo?: ReactNode;
  loading?: boolean;
  actions?: ReactNode;
  innovationPack?: {
    provider?: {
      nameID: string;
      profile: {
        displayName: string;
        avatar?: Visual;
        url: string;
      };
    };
  };
}

const CollaborationTemplatesLibraryPreview = <Template extends TemplateBase, TemplateValue extends {}>({
  template,
  templateCardComponent: TemplateCard,
  templatePreviewComponent: TemplatePreview,
  templateInfo,
  innovationPack,
  loading,
  actions,
  onClose,
}: CollaborationTemplatesLibraryPreviewProps<Template, TemplateValue>) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <GridContainer disablePadding>
      <PageContentColumn columns={3}>
        <TemplateCard template={template as Template | undefined} loading={loading} />
        {templateInfo}
        <PageContentBlockSeamless disablePadding>
          <Actions justifyContent="end">
            <Button startIcon={<ArrowBackIcon />} variant="text" onClick={() => onClose()}>
              {t('buttons.back')}
            </Button>
            {actions}
          </Actions>
        </PageContentBlockSeamless>
        <PageContentBlockSeamless disablePadding disableGap>
          <BlockSectionTitle>{t('common.title')}</BlockSectionTitle>
          <CardText>{template?.profile.displayName}</CardText>
        </PageContentBlockSeamless>
        <PageContentBlockSeamless disablePadding disableGap>
          <BlockSectionTitle>{t('common.description')}</BlockSectionTitle>
          <WrapperMarkdown card>{template?.profile.description ?? ''}</WrapperMarkdown>
        </PageContentBlockSeamless>
        <PageContentBlockSeamless disablePadding disableGap>
          <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
          <TagsComponent tags={template?.profile.tagset?.tags ?? []} height={gutters()} />
        </PageContentBlockSeamless>
        {innovationPack?.provider && (
          <PageContentBlockSeamless disablePadding disableGap>
            <BlockSectionTitle>{t('common.createdBy')}</BlockSectionTitle>
            <BadgeCardView
              visual={
                <Avatar
                  src={innovationPack.provider.profile.avatar?.uri}
                  aria-label="User avatar"
                  alt={t('common.avatar-of', { user: innovationPack.provider.profile.displayName })}
                >
                  {innovationPack.provider.profile.displayName[0]}
                </Avatar>
              }
              component={LinkNoUnderline}
              to={innovationPack.provider.profile.url}
            >
              <BlockSectionTitle>{innovationPack.provider.profile.displayName}</BlockSectionTitle>
            </BadgeCardView>
          </PageContentBlockSeamless>
        )}
      </PageContentColumn>
      <PageContentColumn columns={9} alignSelf="stretch" flexDirection="column">
        <BlockSectionTitle>{t('common.preview')}</BlockSectionTitle>
        {!loading ? <TemplatePreview template={template} /> : <Skeleton height={theme.spacing(40)} />}
      </PageContentColumn>
    </GridContainer>
  );
};

export default CollaborationTemplatesLibraryPreview;
