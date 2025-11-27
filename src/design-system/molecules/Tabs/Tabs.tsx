import React from 'react';
import { Tabs as MuiTabs, Tab as MuiTab, TabsProps as MuiTabsProps } from '@mui/material';

export interface TabItem {
  label: string;
  value: string | number;
  icon?: React.ReactElement;
  disabled?: boolean;
}

export interface TabsProps extends Omit<MuiTabsProps, 'onChange'> {
  items: TabItem[];
  value: string | number;
  onChange: (event: React.SyntheticEvent, newValue: string | number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ items, value, onChange, ...props }) => {
  return (
    <MuiTabs value={value} onChange={onChange} {...props}>
      {items.map((item, index) => (
        <MuiTab key={index} label={item.label} value={item.value} icon={item.icon} disabled={item.disabled} />
      ))}
    </MuiTabs>
  );
};
