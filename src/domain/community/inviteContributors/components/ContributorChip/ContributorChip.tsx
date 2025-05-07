import { gutters } from '@/core/ui/grid/utils';
import { Box, BoxProps, styled, Tooltip } from '@mui/material';
import {
  ContributorSelectorType,
  SelectedContributor,
} from '../FormikContributorsSelectorField/FormikContributorsSelectorField.models';
import { Caption } from '@/core/ui/typography';
import ClearIcon from '@mui/icons-material/Clear';
import ContributorTooltip from '../ContributorTooltip/ContributorTooltip';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

interface ContributorChipProps {
  contributor: SelectedContributor;
  validationError?: string;
  onRemove?: () => void;
}

const RootChip = styled(Box)<BoxProps & { invalid?: boolean }>(({ theme, invalid }) => ({
  color: theme.palette.primary.main,
  border: '1px solid',
  borderColor: invalid ? theme.palette.error.main : theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  marginX: gutters(),
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: gutters(0.5)(theme),
  padding: `${gutters(0.25)(theme)} ${gutters(0.5)(theme)}`,
  '& > svg': {
    cursor: 'pointer',
    height: gutters(0.7)(theme),
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.light,
    },
  },
}));

const ContributorChip = ({ contributor, validationError, onRemove }: ContributorChipProps) => {
  switch (contributor.type) {
    case ContributorSelectorType.User:
      return (
        <ContributorTooltip
          contributorId={contributor.id}
          contributorType={RoleSetContributorType.User}
          override={validationError}
        >
          <RootChip invalid={!!validationError}>
            <Caption>{contributor.displayName}</Caption>
            {onRemove && <ClearIcon fontSize="small" onClick={onRemove} />}
          </RootChip>
        </ContributorTooltip>
      );
    case ContributorSelectorType.Email:
      return (
        <Tooltip title={validationError}>
          <RootChip invalid={!!validationError}>
            <Caption>{contributor.email}</Caption>
            {onRemove && <ClearIcon fontSize="small" onClick={onRemove} />}
          </RootChip>
        </Tooltip>
      );
  }
};

export default ContributorChip;
