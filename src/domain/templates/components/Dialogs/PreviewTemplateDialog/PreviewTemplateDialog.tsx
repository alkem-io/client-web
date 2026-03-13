import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Avatar, Button, DialogContent, styled } from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { gutters } from '@/core/ui/grid/utils';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle, BlockTitle, CardText } from '@/core/ui/typography';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import TemplateCard from '@/domain/templates/components/cards/TemplateCard';
import TemplateContentPreview from '@/domain/templates/components/Previews/TemplateContentPreview';
import type { AnyTemplateWithInnovationPack } from '@/domain/templates/models/TemplateBase';

export interface PreviewTemplateDialogProps extends AnyTemplateWithInnovationPack {
  open?: boolean;
  onClose: () => void;
  templateInfo?: ReactNode; // Extra information about the template, like why I can't import it (see DisabledTemplateInfo)
  actions?: ReactNode;
}

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
});

const PreviewTemplateDialog = ({
  open = false,
  template,
  innovationPack,
  templateInfo,
  onClose,
  actions,
}: PreviewTemplateDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose} aria-labelledby="preview-template-dialog">
      <DialogHeader id="preview-template-dialog" onClose={onClose}>
        <BlockTitle>
          {t('common.preview')} — {template.profile.displayName}
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <PageContentBlockGrid disablePadding={true}>
          <PageContentColumn columns={3}>
            <TemplateCard template={template} />
            {templateInfo}
            <PageContentBlockSeamless disablePadding={true}>
              <Actions justifyContent="end">
                <Button
                  startIcon={<ArrowBackIcon />}
                  variant="text"
                  onClick={() => onClose()}
                  sx={{ marginRight: gutters() }}
                >
                  {t('buttons.back')}
                </Button>
                {actions}
              </Actions>
            </PageContentBlockSeamless>
            <PageContentBlockSeamless disablePadding={true} disableGap={true}>
              <BlockSectionTitle>{t('common.title')}</BlockSectionTitle>
              <CardText>{template?.profile.displayName}</CardText>
            </PageContentBlockSeamless>
            <PageContentBlockSeamless disablePadding={true} disableGap={true}>
              <BlockSectionTitle>{t('common.description')}</BlockSectionTitle>
              <WrapperMarkdown card={true}>{template?.profile.description ?? ''}</WrapperMarkdown>
            </PageContentBlockSeamless>
            <PageContentBlockSeamless disablePadding={true} disableGap={true}>
              <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
              <TagsComponent tags={template?.profile.defaultTagset?.tags ?? []} height={gutters()} />
            </PageContentBlockSeamless>
            {innovationPack?.provider && (
              <PageContentBlockSeamless disablePadding={true} disableGap={true}>
                <BlockSectionTitle>{t('common.createdBy')}</BlockSectionTitle>
                <BadgeCardView
                  visual={
                    <Avatar
                      src={innovationPack.provider.profile?.avatar?.uri}
                      alt={
                        innovationPack.provider.profile?.displayName
                          ? t('common.avatar-of', { user: innovationPack.provider.profile.displayName })
                          : t('common.avatar')
                      }
                    >
                      {innovationPack.provider.profile?.displayName?.[0]}
                    </Avatar>
                  }
                  component={StyledLink}
                  to={innovationPack.provider.profile?.url}
                >
                  <BlockSectionTitle>{innovationPack.provider.profile?.displayName}</BlockSectionTitle>
                </BadgeCardView>
              </PageContentBlockSeamless>
            )}
          </PageContentColumn>
          <PageContentColumn columns={9} alignSelf="stretch" flexDirection="column">
            <BlockSectionTitle>{t('common.preview')}</BlockSectionTitle>
            <TemplateContentPreview template={template} />
          </PageContentColumn>
        </PageContentBlockGrid>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default PreviewTemplateDialog;
