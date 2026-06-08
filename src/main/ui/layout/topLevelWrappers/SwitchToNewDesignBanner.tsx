import { Link } from '@mui/material';
import { Trans } from 'react-i18next';
import { Caption } from '@/core/ui/typography';
import { DESIGN_VERSION_NEW, writeDesignVersionToStorage } from '@/main/crdPages/useCrdEnabled';
import { useDesignVersionToggle } from '@/main/crdPages/useDesignVersionToggle';

const SUPPORT_EMAIL = 'support@alkem.io';

const SwitchToNewDesignBanner = () => {
  const toggle = useDesignVersionToggle();
  const isPending = toggle.isVisible && toggle.isPending;

  const switchToNew = () => {
    // Authenticated users persist the preference to their account (mutation +
    // localStorage + reload); anonymous users flip localStorage and reload.
    if (toggle.isVisible) {
      void toggle.onChange(true);
      return;
    }
    writeDesignVersionToStorage(DESIGN_VERSION_NEW);
    window.location.reload();
  };

  return (
    <Caption
      component="div"
      sx={theme => ({
        backgroundColor: theme.palette.highlight.main,
        color: theme.palette.highlight.contrastText,
        textAlign: 'center',
        paddingX: theme.spacing(2),
        paddingY: theme.spacing(1),
      })}
    >
      <Trans
        i18nKey="topBar.switchBanner.message"
        components={{
          switch: (
            <Link
              component="button"
              type="button"
              onClick={switchToNew}
              disabled={isPending}
              sx={{ verticalAlign: 'baseline', font: 'inherit', textDecoration: 'underline' }}
            />
          ),
          email: <Link href={`mailto:${SUPPORT_EMAIL}`} />,
        }}
      />
    </Caption>
  );
};

export default SwitchToNewDesignBanner;
