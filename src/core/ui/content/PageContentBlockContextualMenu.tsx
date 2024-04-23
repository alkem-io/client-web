import React, { ReactNode, useState } from 'react';
import Menu from '@mui/material/Menu';
import { IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface PageContentBlockContextualMenuProps {
  children: (provided: { closeMenu: () => void }) => ReactNode;
}

export default function PageContentBlockContextualMenu({ children }: PageContentBlockContextualMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const closeMenu = () => setAnchorEl(null);

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
        {children({ closeMenu })}
      </Menu>
    </>
  );
}
