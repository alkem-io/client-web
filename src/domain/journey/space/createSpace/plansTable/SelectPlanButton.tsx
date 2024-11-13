import { useTranslation } from 'react-i18next';
import FullWidthButton from '@core/ui/button/FullWidthButton';
import RouterLink from '@core/ui/link/RouterLink';
import { Caption } from '@core/ui/typography';
import { Button, ButtonProps } from '@mui/material';
import { useContactSupportLocationQuery } from '@core/apollo/generated/apollo-hooks';

interface SelectPlanButtonProps extends ButtonProps {
  plan: {
    id: string;
    displayName: string;
    requiresContactSupport: boolean;
    trialEnabled: boolean;
    enabled: boolean;
    available: boolean;
  };
}

const SelectPlanButton = ({ plan, onClick, ...props }: SelectPlanButtonProps) => {
  const { t } = useTranslation();

  const { data: contactSupport } = useContactSupportLocationQuery({
    skip: !plan.requiresContactSupport,
  });
  const contactSupportUrl = contactSupport?.platform.configuration.locations.contactsupport;

  if (plan.requiresContactSupport && contactSupportUrl) {
    return (
      <Button
        component={RouterLink}
        to={contactSupportUrl}
        blank
        disabled={!plan.available}
        variant="contained"
        sx={{ width: '100%', '&:hover': { color: theme => theme.palette.common.white } }}
      >
        <Caption noWrap textTransform="none">
          {t('plansTable.buttonCaptions.contactSupport')}
        </Caption>
      </Button>
    );
  }
  if (plan.trialEnabled) {
    return (
      <FullWidthButton
        variant="contained"
        onClick={onClick}
        disabled={!plan.available}
        sx={{
          backgroundColor: theme => theme.palette.highlight.dark,
          color: theme => theme.palette.neutral.main,
          '&:hover': {
            backgroundColor: theme => theme.palette.highlight.dark,
          },
        }}
        {...props}
      >
        <Caption noWrap textTransform="none">
          {t('plansTable.buttonCaptions.startTrial')}
        </Caption>
      </FullWidthButton>
    );
  }
  return (
    <FullWidthButton variant="contained" onClick={onClick} disabled={!plan.available} {...props}>
      <Caption noWrap textTransform="none">
        {t('plansTable.buttonCaptions.choose', { planName: plan.displayName })}
      </Caption>
    </FullWidthButton>
  );
};

export default SelectPlanButton;
