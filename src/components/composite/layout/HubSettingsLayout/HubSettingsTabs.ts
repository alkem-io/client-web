import { ComponentType } from 'react';
import createPageTabs from '../../../core/PageTabs/PageTabs';
import { HubSettingsSection } from './constants';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined';

const ICON_MAPPING: Record<HubSettingsSection, ComponentType> = {
  [HubSettingsSection.Profile]: PeopleOutlinedIcon,
  [HubSettingsSection.Context]: ListOutlinedIcon,
  [HubSettingsSection.Community]: PeopleOutlinedIcon,
  [HubSettingsSection.Communications]: ForumOutlinedIcon,
  [HubSettingsSection.Authorization]: GppGoodOutlinedIcon,
  [HubSettingsSection.Challenges]: FlagOutlinedIcon,
  [HubSettingsSection.Templates]: WbIncandescentOutlinedIcon,
};

const HubSettingsTabs = createPageTabs(ICON_MAPPING, section => `common.${section}`);

export default HubSettingsTabs;
