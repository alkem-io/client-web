import type { SvgIconComponent } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, Skeleton, useTheme } from '@mui/material';
import { times } from 'lodash-es';
import type { ReactNode } from 'react';
import RouterLink from '@/core/ui/link/RouterLink';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import EllipsableWithCount from '@/core/ui/typography/EllipsableWithCount';

interface LinkItem {
  id: string;
  title: string;
  url?: string;
  icon?: SvgIconComponent;
  count?: number;
}

export interface LinksListProps {
  links?: LinkItem[];
  loading?: boolean;
  emptyListCaption?: ReactNode;
}

const LinksList = ({ links, loading, emptyListCaption }: LinksListProps) => {
  const theme = useTheme();

  return (
    <List>
      {loading && times(3, i => <ListItem key={i} component={Skeleton} />)}
      {!loading && (!links || links.length === 0) && (
        <ListItem key="_empty">
          <Caption>{emptyListCaption}</Caption>
        </ListItem>
      )}
      {links?.map(link => {
        const { id, url, title, icon: IconComponent, count } = link;
        if (!url) return null;
        return (
          <ListItem key={id} disableGutters={true} component={RouterLink} to={url ?? ''}>
            {IconComponent ? (
              <ListItemIcon>
                <IconComponent sx={{ color: theme.palette.primary.dark }} />
              </ListItemIcon>
            ) : null}
            <BlockSectionTitle minWidth={0} noWrap={true}>
              <EllipsableWithCount count={count}>{title}</EllipsableWithCount>
            </BlockSectionTitle>
          </ListItem>
        );
      })}
    </List>
  );
};

export default LinksList;
