import { useConfig } from '@/domain/platform/config/useConfig';
import { Box, BoxProps } from '@mui/material';
import { Trans, TransProps } from 'react-i18next';
import Paragraph from '@/domain/shared/components/Text/Paragraph';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

interface PlatformIntroductionProps {
  label: TransProps<TranslationKey>['i18nKey'];
}

const Link = (props: BoxProps<'a'>) => {
  return <Box component="a" target="_blank" whiteSpace="nowrap" {...props} />;
};

const PlatformIntroduction = ({ label }: PlatformIntroductionProps) => {
  const { locations } = useConfig();

  return (
    <Box color="neutral.light">
      <Trans
        i18nKey={label}
        components={{
          p: <Paragraph textAlign="left" marginY={0} />,
          terms: <Link sx={{ color: theme => theme.palette.highlight.dark }} href={locations?.terms} />,
          privacy: <Link sx={{ color: theme => theme.palette.highlight.dark }} href={locations?.privacy} />,
        }}
      />
    </Box>
  );
};

export default PlatformIntroduction;
