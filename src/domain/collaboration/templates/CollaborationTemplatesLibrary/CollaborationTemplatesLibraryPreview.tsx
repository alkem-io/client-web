import { Avatar, Button, Skeleton, useTheme } from '@mui/material';
import React, { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BlockSectionTitle, CardText } from '../../../../core/ui/typography/components';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { TemplateBase, TemplateCardBaseProps, TemplatePreviewBaseProps } from './TemplateBase';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { Actions } from '../../../../core/ui/actions/Actions';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import GridContainer from '../../../../core/ui/grid/GridContainer';
import { TemplateType } from '../../InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';
import { gutters } from '../../../../core/ui/grid/utils';
import LinkNoUnderline from '../../../shared/components/LinkNoUnderline';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { Visual } from '../../../common/visual/Visual';
import { buildOrganizationUrl } from '../../../../main/routing/urlBuilders';

export interface CollaborationTemplatesLibraryPreviewProps<
  Template extends TemplateBase,
  TemplateValue extends Template
> {
  onClose: () => void;
  template?: TemplateValue;
  templateCardComponent: ComponentType<TemplateCardBaseProps<Template>>;
  templatePreviewComponent: ComponentType<TemplatePreviewBaseProps<TemplateValue>>;
  templateInfo?: ReactNode;
  loading?: boolean;
  actions?: ReactNode;
  templateType?: TemplateType;
  innovationPack?: {
    provider?: {
      nameID: string;
      profile: {
        displayName: string;
        avatar?: Visual;
      };
    };
  };
}

const CollaborationTemplatesLibraryPreview = <Template extends TemplateBase, TemplateValue extends Template>({
  template,
  templateCardComponent: TemplateCard,
  templatePreviewComponent: TemplatePreview,
  templateInfo,
  templateType,
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
        <PageContentBlockSeamless disablePadding disableGap>
          <BlockSectionTitle>{t('common.type')}</BlockSectionTitle>
          <CardText>{templateType && t(`common.enums.templateTypes.${templateType}` as const)}</CardText>
        </PageContentBlockSeamless>
        <PageContentBlockSeamless disablePadding disableGap>
          <BlockSectionTitle>{t('common.createdBy')}</BlockSectionTitle>
          <BadgeCardView
            visual={
              <Avatar
                src={innovationPack?.provider?.profile.avatar?.uri}
                aria-label="User avatar"
                alt={t('common.avatar-of', { user: innovationPack?.provider?.profile.displayName })}
              >
                {innovationPack?.provider?.profile.displayName[0]}
              </Avatar>
            }
            component={LinkNoUnderline}
            to={innovationPack?.provider && buildOrganizationUrl(innovationPack?.provider?.nameID)}
          >
            <BlockSectionTitle>{innovationPack?.provider?.profile.displayName}</BlockSectionTitle>
          </BadgeCardView>
        </PageContentBlockSeamless>
      </PageContentColumn>
      <PageContentColumn columns={9}>
        <PageContentBlockSeamless>
          {!loading ? <TemplatePreview template={template} /> : <Skeleton height={theme.spacing(40)} />}
        </PageContentBlockSeamless>
      </PageContentColumn>
    </GridContainer>
  );
};

export default CollaborationTemplatesLibraryPreview;
