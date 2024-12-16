import { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { BlockSectionTitle, CardText } from '@/core/ui/typography';
import { Button, DialogContent } from '@mui/material';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import { Actions } from '@/core/ui/actions/Actions';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import { gutters } from '@/core/ui/grid/utils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import UserCard from '../user/userCard/UserCard';
import { ContributorProps } from './InviteContributorsProps';

interface PreviewContributorDialogProps {
  open?: boolean;
  onClose: () => void;
  contributor: ContributorProps | undefined;
  actions?: ReactNode;
}

const PreviewContributorDialog = ({
  children,
  open = false,
  contributor,
  onClose,
  actions,
}: PropsWithChildren<PreviewContributorDialogProps>) => {
  const { t } = useTranslation();

  const { profile } = contributor ?? {};

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose}>
      <DialogContent>
        <PageContentBlockGrid disablePadding>
          <PageContentColumn columns={3}>
            <UserCard
              displayName={profile?.displayName}
              avatarSrc={profile?.avatar?.uri ?? ''}
              avatarAltText={profile?.displayName}
              tags={profile?.tagsets?.flatMap(tagset => tagset.tags) ?? []}
              city={profile?.location?.city ?? ''}
              country={profile?.location?.country ?? ''}
              isContactable={false}
            />
            <PageContentBlockSeamless disablePadding>
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
            <PageContentBlockSeamless disablePadding disableGap>
              <BlockSectionTitle>{t('common.title')}</BlockSectionTitle>
              <CardText>{profile?.displayName}</CardText>
            </PageContentBlockSeamless>
            <PageContentBlockSeamless disablePadding disableGap>
              <BlockSectionTitle>{t('common.description')}</BlockSectionTitle>
              <WrapperMarkdown card>{profile?.description ?? ''}</WrapperMarkdown>
            </PageContentBlockSeamless>
            <PageContentBlockSeamless disablePadding disableGap>
              <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
              <TagsComponent tags={profile?.tagsets?.flatMap(tagset => tagset.tags) ?? []} height={gutters()} />
            </PageContentBlockSeamless>
          </PageContentColumn>
          <PageContentColumn columns={9} alignSelf="stretch" flexDirection="column">
            {children}
          </PageContentColumn>
        </PageContentBlockGrid>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default PreviewContributorDialog;
