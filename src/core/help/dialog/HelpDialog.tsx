import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Dialog, Grid, Link, styled, Typography } from '@mui/material';
import QuizOutlinedIzon from '@mui/icons-material/QuizOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import FiberNewTwoToneIcon from '@mui/icons-material/FiberNewTwoTone';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { DialogActions, DialogContent, DialogTitle } from '../../ui/dialog/deprecated';
import WrapperMarkdown from '../../ui/markdown/WrapperMarkdown';
import { useConfig } from '../../../domain/platform/config/useConfig';

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
  padding: theme.spacing(4),
  textAlign: 'center',
  fontWeight: 'bold',
}));

const Icon = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.dark,
  width: theme.spacing(8),
  height: theme.spacing(8),
  display: 'block',
  margin: theme.spacing(2, 'auto', 2, 'auto'),
}));

const FooterLink = styled(Link)(({ theme }) => ({
  '& svg': {
    position: 'relative',
    top: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  textDecoration: 'underline',
}));

// Our Material FiberNew icon doesn't have a border around it like in the design.
// In its TwoTone version it has a border but has a background with 0.3 opacity that doesn't look good either.
// With this CSS rule that background is hidden and the FiberNewTwoToneIcon looks like in the designs
const CustomNewIcon = styled(FiberNewTwoToneIcon)(() => ({
  '& > path:nth-of-type(2)': { opacity: 0 },
}));

const HelpDialog: FC<HelpDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { locations } = useConfig();
  const handleClose = () => (onClose ? onClose() : undefined);
  const faq = `${locations?.help}`;
  const contactUs = `${locations?.support}`;
  const gettingStarted = `${locations?.help}/getting-started`;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={'xl'}>
      <DialogTitle onClose={handleClose}>
        <Typography variant="h3">{t('pages.help-dialog.title')}</Typography>
      </DialogTitle>
      <HelpDialogContent>
        <WrapperMarkdown>{t('pages.help-dialog.text')}</WrapperMarkdown>
        <Grid container columns={{ xs: 4, sm: 6 }}>
          <Grid item xs={2}>
            <IconWrapper href={faq} target="_blank">
              <Icon component={QuizOutlinedIzon} />
              {t('pages.help-dialog.icons.help-center-faq')}
            </IconWrapper>
          </Grid>
          <Grid item xs={2}>
            <IconWrapper href={contactUs} target="_blank">
              <Icon component={ForumOutlinedIcon} />
              {t('pages.help-dialog.icons.community-support-forum')}
            </IconWrapper>
          </Grid>
          <Grid item xs={2}>
            <IconWrapper href={gettingStarted} target="_blank">
              <Icon component={CustomNewIcon} />
              {t('pages.help-dialog.icons.new-user')}
            </IconWrapper>
          </Grid>
        </Grid>
        <FooterLink href={locations?.tips} target="_blank">
          <ArrowForwardIcon />
          {t('pages.help-dialog.tips-and-tricks')}
        </FooterLink>
      </HelpDialogContent>
      <DialogActions />
    </Dialog>
  );
};

export default HelpDialog;
