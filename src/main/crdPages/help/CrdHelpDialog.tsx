import { HelpDialog } from '@/crd/components/common/HelpDialog';
import { useConfig } from '@/domain/platform/config/useConfig';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { buildWelcomeSpaceUrl } from '@/main/routing/urlBuilders';

type CrdHelpDialogProps = {
  open: boolean;
  onClose: () => void;
};

const CrdHelpDialog = ({ open, onClose }: CrdHelpDialogProps) => {
  const {
    locations,
    serverMetadata: { services },
  } = useConfig();

  return (
    <HelpDialog
      open={open}
      onClose={onClose}
      version={import.meta.env.VITE_VERSION ?? 'N/A'}
      serverVersion={services?.[0]?.version ?? 'N/A'}
      docsHref={`/${TopLevelRoutePath.Docs}`}
      supportHref={locations?.support}
      welcomeSpaceHref={buildWelcomeSpaceUrl()}
    />
  );
};

export default CrdHelpDialog;
