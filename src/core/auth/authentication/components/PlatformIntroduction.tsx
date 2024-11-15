import { useConfig } from '@/domain/platform/config/useConfig';
import { Box, BoxProps } from '@mui/material';
import { Trans } from 'react-i18next';
import Paragraph from '@/domain/shared/components/Text/Paragraph';
import TranslationKey from '../../../i18n/utils/TranslationKey';

interface PlatformIntroductionProps {
  label: TranslationKey;
}

const Link = (props: BoxProps<'a'>) => {
  return <Box component="a" target="_blank" whiteSpace="nowrap" {...props} />;
};

const PlatformIntroduction = ({ label }: PlatformIntroductionProps) => {
  const { locations } = useConfig();

  return (
    <Box>
      <Trans
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18nKey={label as any /* Trans doesn't recognize its own TranslationKey as a valid type */}
        components={{
          p: <Paragraph textAlign="center" />,
          terms: <Link href={locations?.terms} />,
          privacy: <Link href={locations?.privacy} />,
        }}
      />
    </Box>
  );
};

export default PlatformIntroduction;
