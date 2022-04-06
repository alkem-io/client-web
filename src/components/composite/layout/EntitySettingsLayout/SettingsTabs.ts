import { ComponentType } from 'react';
import createPageTabs from '../../../core/PageTabs/PageTabs';
import { SettingsSection } from './constants';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined';

const ICON_MAPPING: Record<SettingsSection, ComponentType> = {
  [SettingsSection.Profile]: PeopleOutlinedIcon,
  [SettingsSection.Context]: ListOutlinedIcon,
  [SettingsSection.Community]: PeopleOutlinedIcon,
  [SettingsSection.Communications]: ForumOutlinedIcon,
  [SettingsSection.Authorization]: GppGoodOutlinedIcon,
  [SettingsSection.Challenges]: FlagOutlinedIcon,
  [SettingsSection.Opportunities]: FlagOutlinedIcon,
  [SettingsSection.Templates]: WbIncandescentOutlinedIcon,
};

const SettingsTabs = createPageTabs(ICON_MAPPING, section => `common.${section}`);

export default SettingsTabs;
