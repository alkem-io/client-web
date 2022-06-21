import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, IconButton, Link, Toolbar, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import React, { FC, useState } from 'react';
import { RouterLink } from '../../../core/RouterLink';
import Section, { SectionProps, SectionSpacer } from '../../../../domain/shared/components/Section/Section';
import SectionHeader from '../../../../domain/shared/components/Section/SectionHeader';
import SectionSubHeader from '../../../../domain/shared/components/Section/SectionSubheader';

export interface DashboardGenericSectionProps {
  bannerUrl?: string;
  alwaysShowBanner?: boolean;
  bannerOverlay?: React.ReactNode;
  headerText?: React.ReactNode;
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
  };
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

const DashboardGenericSection: FC<DashboardGenericSectionProps> = ({
  bannerUrl,
  alwaysShowBanner,
  bannerOverlay,
  headerText,
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
}) => {
  const navLinkIsRelative = navLink && navLink.search(relativeLinkRegex) > -1;
  const cleanNavLink = navLink && !navLinkIsRelative ? navLink.replace(relativeLinkRegex, '') : navLink;
  const routerNavLink = cleanNavLink && relativeStepBackRoute.concat(cleanNavLink);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const styles = useStyles();

  return (
    <Section bannerUrl={bannerUrl} classes={classes} alwaysShowBanner={alwaysShowBanner} bannerOverlay={bannerOverlay}>
      {headerText && (
        <SectionHeader text={headerText} helpText={helpText}>
          {primaryAction}
        </SectionHeader>
      )}
      {subHeaderText && typeof subHeaderText === 'string' ? (
        <>
          <SectionSpacer />
          <SectionSubHeader text={subHeaderText} />
        </>
      ) : (
        subHeaderText
      )}
      {(headerText || subHeaderText) && !(headerSpacing === 'none') && (
        <SectionSpacer double={headerSpacing === 'double'} />
      )}
      <Box
        paddingY={1}
        maxHeight={isCollapsed && options?.collapsible ? options.collapsible.maxHeight : 'auto'}
        textOverflow="ellipsis"
        overflow="hidden"
      >
        {children}
        {secondaryAction}
      </Box>
      {navText && routerNavLink && (
        <Box display="flex" justifyContent="end">
          <Link component={RouterLink} to={routerNavLink}>
            {navText}
          </Link>
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
              aria-label="show more"
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
