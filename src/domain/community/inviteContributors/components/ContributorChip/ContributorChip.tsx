import { gutters } from '@/core/ui/grid/utils';
import { Box, BoxProps, styled, Tooltip } from '@mui/material';
import {
  ContributorSelectorType,
  SelectedContributor,
} from '../FormikContributorsSelectorField/FormikContributorsSelectorField.models';
import { Caption } from '@/core/ui/typography';
import ClearIcon from '@mui/icons-material/Clear';
import ContributorTooltip from '../../../contributor/ContributorTooltip/ContributorTooltip';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface ContributorChipProps {
  contributor: SelectedContributor;
  validationError?: string;
  onRemove?: () => void;
}

const StyledChip = styled(Box)<BoxProps & { invalid?: boolean }>(({ theme, invalid }) => ({
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
  const { t } = useTranslation();

  switch (contributor.type) {
    case ContributorSelectorType.User:
      return (
        <ContributorTooltip
          contributorId={contributor.id}
          contributorType={RoleSetContributorType.User}
          override={validationError}
        >
          <StyledChip invalid={!!validationError}>
            <Caption>{contributor.displayName}</Caption>
            {onRemove && <ClearIcon fontSize="small" onClick={onRemove} />}
          </StyledChip>
        </ContributorTooltip>
      );
    case ContributorSelectorType.Email:
      return (
        <Tooltip
          arrow
          title={
            validationError
              ? validationError
              : t('community.invitations.inviteContributorsDialog.users.invitationByEmailTooltip', {
                  email: contributor.displayName,
                })
          }
        >
          <StyledChip invalid={!!validationError}>
            <Caption>{contributor.email}</Caption>
            {onRemove && <ClearIcon fontSize="small" onClick={onRemove} />}
          </StyledChip>
        </Tooltip>
      );
  }
};

export default ContributorChip;
