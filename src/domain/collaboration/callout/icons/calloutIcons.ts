import { ComponentType } from 'react';
import { SvgIconProps, Tooltip } from '@mui/material';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { LibraryBooksOutlined } from '@mui/icons-material';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { ReferenceIcon } from '@/domain/shared/components/References/icons/ReferenceIcon';
import { MemoIcon } from '@/domain/collaboration/memo/icon/MemoIcon';
import { CtaIcon } from '@/domain/collaboration/callout/icons/CtaIcon';
import { useTranslation } from 'react-i18next';
import React from 'react';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

export const GenericCalloutIcon = LibraryBooksOutlined;

export const calloutFramingIcons: Record<CalloutFramingType, ComponentType<SvgIconProps>> = {
  [CalloutFramingType.None]: LibraryBooksOutlined,
  [CalloutFramingType.Memo]: MemoIcon,
  [CalloutFramingType.Whiteboard]: WhiteboardIcon,
  [CalloutFramingType.Link]: CtaIcon,
};

export const contributionIcons: Record<CalloutContributionType, ComponentType<SvgIconProps>> = {
  [CalloutContributionType.Link]: ReferenceIcon,
  [CalloutContributionType.Post]: LibraryBooksOutlined,
  [CalloutContributionType.Memo]: MemoIcon,
  [CalloutContributionType.Whiteboard]: WhiteboardIcon,
};

const getCalloutIconBasedOnType = (
  framingType: CalloutFramingType,
  contributionType?: CalloutContributionType
): ComponentType<SvgIconProps> => {
  if (framingType !== CalloutFramingType.None) {
    return calloutFramingIcons[framingType] || GenericCalloutIcon;
  }

  if (contributionType && contributionIcons[contributionType]) {
    return contributionIcons[contributionType];
  }

  return GenericCalloutIcon;
};

// Returns an i18n key describing the icon. Consumers can translate it.
const getCalloutIconLabelKey = (
  framingType: CalloutFramingType,
  contributionType?: CalloutContributionType
): TranslationKey => {
  if (framingType !== CalloutFramingType.None) {
    return `common.calloutType.${framingType}`;
  }

  if (contributionType) {
    return `common.calloutType.${contributionType}`;
  }

  return 'common.calloutType.POST';
};

interface CalloutIconProps {
  framingType: CalloutFramingType;
  contributionType?: CalloutContributionType;
  tooltip?: boolean; // wrap icon in MUI Tooltip
  iconProps?: SvgIconProps; // forwarded to icon component
}

// React component that encapsulates icon selection + optional, accessible title/tooltip.
export const CalloutIcon = ({ framingType, contributionType, tooltip = false, iconProps }: CalloutIconProps) => {
  const Icon = getCalloutIconBasedOnType(framingType, contributionType);
  const { t } = useTranslation();
  const labelKey = getCalloutIconLabelKey(framingType, contributionType);
  const label = t(labelKey);
  const element = React.createElement(Icon, { ...(iconProps || {}), ...(tooltip ? {} : { titleAccess: label }) });

  return tooltip ? React.createElement(Tooltip, { title: label, placement: 'left', children: element }) : element;
};
