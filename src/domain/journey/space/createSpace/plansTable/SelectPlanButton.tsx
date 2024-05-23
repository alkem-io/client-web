import { useTranslation } from 'react-i18next';
import FullWidthButton from '../../../../../core/ui/button/FullWidthButton';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import { Caption } from '../../../../../core/ui/typography';
import { ButtonProps } from '@mui/material';
import { useContactSupportLocationQuery } from '../../../../../core/apollo/generated/apollo-hooks';

interface SelectPlanButtonProps extends ButtonProps {
  plan: {
    id: string;
    displayName: string;
    requiresContactSupport: boolean;
    trialEnabled: boolean;
    enabled: boolean;
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
      <FullWidthButton
        variant="contained"
        component={RouterLink}
        disabled={!plan.enabled}
        to={contactSupportUrl}
        target="_blank"
        {...props}
      >
        <Caption noWrap textTransform="none">
          {t('plansTable.buttonCaptions.contactSupport')}
        </Caption>
      </FullWidthButton>
    );
  }
  if (plan.trialEnabled) {
    return (
      <FullWidthButton
        variant="contained"
        onClick={onClick}
        disabled={!plan.enabled}
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
    <FullWidthButton variant="contained" onClick={onClick} disabled={!plan.enabled} {...props}>
      <Caption noWrap textTransform="none">
        {t('plansTable.buttonCaptions.choose', { planName: plan.displayName })}
      </Caption>
    </FullWidthButton>
  );
};

export default SelectPlanButton;
