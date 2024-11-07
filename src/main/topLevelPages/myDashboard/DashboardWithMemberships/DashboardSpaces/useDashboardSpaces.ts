import { useMemo, useState } from 'react';

import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Theme, useMediaQuery } from '@mui/material';

import { useColumns } from '../../../../../core/ui/grid/GridContext';
import { useDashboardWithMembershipsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { RECENT_JOURNEY_CARD_ASPECT_RATIO } from '../../../../../domain/journey/common/JourneyTile/JourneyTile';

export const useDashboardSpaces = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSpaceName, setSelectedSpaceName] = useState('');
  const [selectedSpaceIdx, setSelectedSpaceIdx] = useState<number | null>(null);

  const { data, loading } = useDashboardWithMembershipsQuery();

  const theme = useTheme();

  const columns = useColumns();

  const { t } = useTranslation();

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const cardColumns = useMemo(() => (isMobile ? columns / 2 : columns / 4), [isMobile, columns]);

  return {
    t,
    data,
    loading,
    cardColumns,
    isDialogOpen,
    selectedSpaceIdx,
    selectedSpaceName,
    styles: {
      spacesContainer: {
        padding: 16,
      },

      spaceCard: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      },

      spaceCardMedia: {
        width: '100vw', // Keep this in order to span the image across the card.
        height: '180px',
        maxWidth: '100%', //  Keep this in order to prevent the image from stretching.
      },

      titleAndDescContainer: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        backgroundColor: theme.palette.primary.main,
      },

      spaceTitle: {
        paddingBlock: 16,
        color: theme.palette.background.paper,
      },

      spaceTagline: {
        color: theme.palette.background.paper,
      },

      subSpacesContainer: {
        paddingInline: 0,
      },

      exploreAllButton: {
        textTransform: 'none',
        border: `1px solid ${theme.palette.divider}`,
        aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO,
      },
    },
    visibleSpaces: Math.max(1, Math.floor(columns / 2) - 1),
    setIsDialogOpen,
    setSelectedSpaceIdx,
    setSelectedSpaceName,
  };
};
