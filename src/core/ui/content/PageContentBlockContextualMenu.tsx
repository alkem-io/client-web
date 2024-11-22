import { ReactNode, useState } from 'react';
import Menu from '@mui/material/Menu';
import { IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import unwrapFragment from '../utils/unwrapFragment';

export default function PageContentBlockContextualMenu({
  children: renderChildren,
}: {
  children: (provided: { closeMenu: () => void }) => ReactNode;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const closeMenu = () => setAnchorEl(null);

  const children = renderChildren({ closeMenu });

  return (
    <>
      <IconButton
        aria-haspopup="true"
        size="small"
        sx={{ padding: 0 }}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        <MoreVertIcon fontSize="small" sx={{ padding: 0 }} />
      </IconButton>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={closeMenu}>
        {unwrapFragment(children)}
      </Menu>
    </>
  );
}
