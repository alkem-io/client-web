import { IconButton, SvgIconProps, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Settings } from '@mui/icons-material';
import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface SettingsButtonProps {
  tooltip?: string;
  to: string;
  color?: SvgIconProps['color'];
  htmlColor?: SvgIconProps['htmlColor'];
}

const useSettingsButtonStyle = makeStyles(() => ({
  edit: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

export const SettingsButton: FC<SettingsButtonProps> = ({ color, htmlColor = 'white', to, tooltip }) => {
  const styles = useSettingsButtonStyle();

  return (
    <Tooltip placement={'bottom'} id={'settings-button'} title={tooltip || ''}>
      <RouterLink to={to}>
        <IconButton size={'small'} aria-label="settings-button">
          <Settings color={color} htmlColor={htmlColor} className={styles.edit} fontSize={'large'} />
        </IconButton>
      </RouterLink>
    </Tooltip>
  );
};

export default SettingsButton;
