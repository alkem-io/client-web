import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import { IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface PageContentBlockContextualMenuProps {
  children: (provided: { closeMenu: () => void }) => JSX.Element;
}

export default function PageContentBlockContextualMenu({ children }: PageContentBlockContextualMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const closeMenu = () => setAnchorEl(null);

  // This avoids a browser console warning about MUI Menu not accepting React.Fragment inside.
  // If there is only one child it will be unwrapped.
  const unwrapChildren = (elements: JSX.Element) => {
    if (!Array.isArray(elements)) {
      return elements.props.children;
    } else {
      return elements;
    }
  };

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
        {unwrapChildren(children({ closeMenu }))}
      </Menu>
    </>
  );
}
