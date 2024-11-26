import { Trans, useTranslation } from 'react-i18next';
import { Box, Grid, Link, styled } from '@mui/material';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import FiberNewTwoToneIcon from '@mui/icons-material/FiberNewTwoTone';
import { DialogContent } from '@/core/ui/dialog/deprecated';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { useConfig } from '@/domain/platform/config/useConfig';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import useServerMetadata from '@/domain/platform/metadata/useServerMetadata';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption } from '@/core/ui/typography';
import { buildWelcomeSpaceUrl } from '@/main/routing/urlBuilders';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const HelpDialogContent = styled(DialogContent)(({ theme }) => ({
  '& a': { color: theme.palette.common.black },
  '& a:hover': { color: theme.palette.primary.light },
}));

const IconWrapper = styled(Link)(({ theme }) => ({
  display: 'block',
  position: 'relative',
  padding: theme.spacing(2),
  textAlign: 'center',
  fontWeight: 'bold',
}));

const Icon = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  width: theme.spacing(5),
  height: theme.spacing(5),
  display: 'block',
  margin: theme.spacing(2, 'auto', 2, 'auto'),
}));

// Our Material FiberNew icon doesn't have a border around it like in the design.
// In its TwoTone version it has a border but has a background with 0.3 opacity that doesn't look good either.
// With this CSS rule that background is hidden and the FiberNewTwoToneIcon looks like in the designs
const CustomNewIcon = styled(FiberNewTwoToneIcon)(() => ({
  '& > path:nth-of-type(2)': { opacity: 0 },
}));

const HelpDialog = ({ open, onClose }: HelpDialogProps) => {
  const { t } = useTranslation();

  const { locations } = useConfig();

  const { services } = useServerMetadata();

  const handleClose = () => (onClose ? onClose() : undefined);

  const supportHref = locations?.support;
  const docsHref = `/${TopLevelRoutePath.Docs}`;
  const welcomeSpaceHref = buildWelcomeSpaceUrl();

  return (
    <DialogWithGrid open={open} columns={6} onClose={handleClose}>
      <DialogHeader title={t('pages.help-dialog.title')} onClose={handleClose} />
      <HelpDialogContent>
        <WrapperMarkdown>{t('pages.help-dialog.text')}</WrapperMarkdown>
        <Grid container columns={{ xs: 4, sm: 6 }}>
          <Grid item xs={2}>
            <IconWrapper
              href={docsHref}
              target="_blank"
              rel="noopener"
              aria-label={t('pages.help-dialog.icons.exploreDocumentation')}
            >
              <Icon component={QuizOutlinedIcon} />
              {t('pages.help-dialog.icons.exploreDocumentation')}
            </IconWrapper>
          </Grid>

          <Grid item xs={2}>
            <IconWrapper
              href={supportHref}
              target="_blank"
              rel="noopener"
              aria-label={t('pages.help-dialog.icons.contactTheTeam')}
            >
              <Icon component={ForumOutlinedIcon} />
              {t('pages.help-dialog.icons.contactTheTeam')}
            </IconWrapper>
          </Grid>

          <Grid item xs={2}>
            <IconWrapper
              href={welcomeSpaceHref}
              target="_blank"
              rel="noopener"
              aria-label={t('pages.help-dialog.icons.joinTheWelcomeSpace')}
            >
              <Icon component={CustomNewIcon} />
              {t('pages.help-dialog.icons.joinTheWelcomeSpace')}
            </IconWrapper>
          </Grid>
        </Grid>

        <Gutters row justifyContent="center">
          <Gutters row gap={1} disablePadding>
            <Caption>
              <Trans
                i18nKey="pages.help-dialog.versionNumber"
                components={{ b: <strong /> }}
                values={{ version: import.meta.env.VITE_APP_VERSION }}
              />
            </Caption>
          </Gutters>

          <Gutters row gap={1} disablePadding>
            <Caption>
              <Trans
                i18nKey="pages.help-dialog.serverVersionNumber"
                components={{ b: <strong /> }}
                values={{ version: services?.[0]?.version ?? 'N/A' }}
              />
            </Caption>
          </Gutters>
        </Gutters>

        {/* <Grid sx={{ display: 'flex', justifyContent: 'center', marginTop: gutters(2) }}>
          <Box sx={{ marginLeft: gutters(2) }}>
            <Trans
              i18nKey="pages.help-dialog.versionNumber"
              components={{ b: <strong /> }}
              values={{ version: import.meta.env.VITE_APP_VERSION }}
            />
          </Box>

          <Box sx={{ marginLeft: gutters(2) }}>
            <Trans
              i18nKey="pages.help-dialog.serverVersionNumber"
              components={{ b: <strong /> }}
              values={{ version: services?.[0]?.version ?? 'N/A' }}
            />
          </Box>
        </Grid> */}
      </HelpDialogContent>
    </DialogWithGrid>
  );
};

export default HelpDialog;
