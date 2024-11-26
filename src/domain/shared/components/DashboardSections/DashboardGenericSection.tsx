import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, IconButton, Toolbar, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import clsx from 'clsx';
import React, { FC, useState } from 'react';
import { RouterLink } from '@/core/ui/link/deprecated/RouterLink';
import Section, { SectionProps, SectionSpacer } from '../Section/Section';
import SectionHeader from '../Section/SectionHeader';
import Button from '@mui/material/Button';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';

export interface DashboardGenericSectionProps {
  bannerUrl?: string;
  alwaysShowBanner?: boolean;
  bannerOverlay?: React.ReactNode;
  headerText?: React.ReactNode;
  headerIcon?: React.ReactNode;
  headerCounter?: number;
  helpText?: string;
  headerSpacing?: 'double' | 'none' | 'default';
  primaryAction?: React.ReactNode;
  subHeaderText?: string | React.ReactNode;
  secondaryAction?: React.ReactNode;
  navText?: string;
  navLink?: string;
  classes?: SectionProps['classes'];
  options?: {
    collapsible?: {
      maxHeight: number;
    };
    overflowVisible?: boolean;
  };
  sideBanner?: boolean;
  sideBannerRight?: boolean;
}

const relativeLinkRegex = /^\.+\//;
const relativeStepBackRoute = '../';

const useStyles = makeStyles(theme => ({
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
}));

/**
 * @deprecated - use PageContentBlock instead
 */
const DashboardGenericSection: FC<DashboardGenericSectionProps> = ({
  bannerUrl,
  alwaysShowBanner,
  bannerOverlay,
  headerText,
  headerIcon,
  headerCounter,
  subHeaderText,
  helpText,
  headerSpacing = 'default',
  primaryAction,
  secondaryAction,
  navText,
  navLink,
  classes,
  options,
  children,
  sideBanner,
  sideBannerRight,
}) => {
  const { t } = useTranslation();
  const navLinkIsRelative = navLink && navLink.search(relativeLinkRegex) > -1;
  const cleanNavLink = navLink && !navLinkIsRelative ? navLink.replace(relativeLinkRegex, '') : navLink;
  const routerNavLink = cleanNavLink && relativeStepBackRoute.concat(cleanNavLink);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const styles = useStyles();

  return (
    <Section
      bannerUrl={bannerUrl}
      classes={classes}
      alwaysShowBanner={alwaysShowBanner}
      bannerOverlay={bannerOverlay}
      sideBanner={sideBanner}
      sideBannerRight={sideBannerRight}
    >
      {headerText && (
        <SectionHeader text={headerText} icon={headerIcon} helpText={helpText} counter={headerCounter}>
          {primaryAction}
        </SectionHeader>
      )}
      {subHeaderText && typeof subHeaderText === 'string' ? <Caption>{subHeaderText}</Caption> : subHeaderText}
      {(headerText || subHeaderText) && !(headerSpacing === 'none') && (
        <SectionSpacer double={headerSpacing === 'double'} />
      )}
      <Box
        paddingY={1}
        maxHeight={isCollapsed && options?.collapsible ? options.collapsible.maxHeight : 'auto'}
        textOverflow="ellipsis"
        overflow={options?.overflowVisible ? 'visible' : 'hidden'}
      >
        {children}
        {secondaryAction}
      </Box>
      {navText && routerNavLink && (
        <Box display="flex" justifyContent="end">
          <Button startIcon={<ArrowForwardIcon />} component={RouterLink} to={routerNavLink}>
            {navText}
          </Button>
        </Box>
      )}
      {options?.collapsible && (
        <Toolbar variant="dense" disableGutters sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title={isCollapsed ? 'View entire content' : 'Minimize'} placement="left">
            <IconButton
              className={clsx(styles.expand, {
                [styles.expandOpen]: !isCollapsed,
              })}
              onClick={() => setIsCollapsed(x => !x)}
              aria-expanded={!isCollapsed}
              aria-label={t('common.show-more')}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      )}
    </Section>
  );
};

export default DashboardGenericSection;
