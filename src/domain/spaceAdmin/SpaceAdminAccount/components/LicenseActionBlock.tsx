import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import { Caption, CaptionSmall } from '@/core/ui/typography';
import { SvgIconComponent } from '@mui/icons-material';
import { styled } from '@mui/material';
import { PropsWithChildren } from 'react';

const StyledPageContentBlock = styled(PageContentBlock)(({ theme }) => ({
  color: theme.palette.primary.main,
  svg: { verticalAlign: 'middle', marginRight: gutters(0.5) },
}));

const LicenseActionBlock = ({
  title,
  description,
  disabled,
  icon: Icon,
  onClick,
  href,
  children,
}: PropsWithChildren<{
  icon: SvgIconComponent;
  title: string;
  description: string;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
}>) => {
  const captionProps = {
    ...(disabled
      ? {} // If disabled it's just a Caption
      : onClick
      ? { onClick, sx: { cursor: 'pointer' } } // If enabled and onClick is defined, pass onClick and cursor pointer
      : href
      ? { component: RouterLink, to: href, target: '_blank' } // If enabled and href is defined, use RouterLink component
      : {}),
  };

  return (
    <StyledPageContentBlock>
      <Caption {...captionProps}>
        <Icon fontSize="small" sx={{ marginRight: gutters(0.5) }} />
        {title}
      </Caption>
      <CaptionSmall>{description}</CaptionSmall>
      {children}
    </StyledPageContentBlock>
  );
};

export default LicenseActionBlock;
