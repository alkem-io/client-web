import { Button, ButtonProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
interface CreateContributionButtonProps extends ButtonProps {
  contributionType: CalloutContributionType;
}

const CreateContributionButton = ({ contributionType, ...props }: CreateContributionButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button aria-label={t('common.add')} variant="outlined" {...props}>
      {t('buttons.addSubject', { subject: t(`common.enums.calloutContributionType.${contributionType}`) })}
    </Button>
  );
};

export default CreateContributionButton;
