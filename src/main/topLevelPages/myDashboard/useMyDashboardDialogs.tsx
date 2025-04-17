import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// these constants are used to identify the dialog in the URL
// the same should be set in the Notifications service
export const DIALOG_PARAM_KEY = 'dialog';
export enum DIALOG_PARAM_VALUES {
  INVITATIONS = 'invitations',
}

type UseMyDashboardDialogsProps = {
  paramValue: DIALOG_PARAM_VALUES;
  onDialogOpen: () => void;
  cleanParams?: boolean;
};

/**
 * Custom hook to handle the dialog based on URL search parameters.
 *
 * This hook listens for the presence of a specific dialog parameter (`dialog=DIALOG_PARAM_VALUES.INVITATIONS`)
 * in the URL search parameters. When the parameter is detected, it triggers the provided
 * `onDialogOpen` callback and optionally cleans the parameter from the URL.
 *
 * @param {Object} props - The properties for the hook.
 * @param {DIALOG_PARAM_VALUES} [props.paramValue] - The dialog type from DIALOG_PARAM_VALUES.
 * @param {() => void} props.onDialogOpen - Callback function to execute when the dialog parameter is detected.
 * @param {boolean} [props.cleanParams=false] - Whether to remove the dialog parameter from the URL after detection.
 *
 * @example
 * useMyDashboardDialogs({
 *   paramValue: DIALOG_PARAM_VALUES.INVITATIONS,
 *   onDialogOpen: () => openMembershipsDialog(),
 *   cleanParams: true,
 * });
 */
export const useMyDashboardDialogs = ({
  paramValue,
  onDialogOpen,
  cleanParams = false,
}: UseMyDashboardDialogsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const dialogParam = searchParams.get(DIALOG_PARAM_KEY);

    if (searchParams.toString() && dialogParam === paramValue) {
      if (cleanParams && searchParams.has(DIALOG_PARAM_KEY)) {
        setSearchParams({});
      }
      onDialogOpen();
    }
  }, [searchParams, onDialogOpen, cleanParams]);
};
