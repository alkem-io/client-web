import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Collapse, BoxProps, IconButtonProps, styled, IconButton, Divider } from '@mui/material';
import { ReactNode, useState } from 'react';
import PageContentBlock, { PageContentBlockProps } from './PageContentBlock';
import { gutters } from '../grid/utils';
import PageContentBlockSeamless from './PageContentBlockSeamless';
import { useTranslation } from 'react-i18next';

interface ExpandMoreButtonProps extends IconButtonProps {
  collapsed: boolean;
  withActions?: boolean;
}

const ExpandMoreButton = styled((props: ExpandMoreButtonProps) => {
  const { collapsed, withActions, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, withActions }) => ({
  marginLeft: withActions ? 0 : 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ collapsed }) => !!collapsed,
      style: {
        transform: 'rotate(0deg)',
      },
    },
    {
      props: ({ collapsed }) => !collapsed,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));

interface PageContentBlockCollapsibleProps extends PageContentBlockProps {
  header: ReactNode;
  primaryAction?: ReactNode;
  collapseHeaderProps?: BoxProps;
  seamless?: boolean; // If true, the block will not have a gap at the bottom
  children: ReactNode;
}

const PageContentBlockCollapsible = ({
  ref,
  header,
  primaryAction,
  children,
  collapseHeaderProps,
  seamless = false,
  ...props
}: PageContentBlockCollapsibleProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const Block = seamless ? PageContentBlockSeamless : PageContentBlock;

  return (
    <Block ref={ref} {...props} disableGap={isCollapsed ? true : props.disableGap} disablePadding={seamless}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ cursor: 'pointer' }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        {...collapseHeaderProps}
      >
        {header}
        {primaryAction &&
          (isCollapsed ? undefined : (
            <Box marginLeft="auto" marginRight={gutters(0.5)} onClick={event => event.stopPropagation()}>
              {primaryAction}
            </Box>
          ))}
        {seamless && <Divider sx={{ flexGrow: 1, marginLeft: gutters(0.5) }} />}
        <ExpandMoreButton collapsed={isCollapsed} aria-label={t('buttons.expand')} withActions={!!primaryAction}>
          <ExpandMoreIcon />
        </ExpandMoreButton>
      </Box>
      <Collapse in={!isCollapsed}>{children}</Collapse>
    </Block>
  );
};

export default PageContentBlockCollapsible;
