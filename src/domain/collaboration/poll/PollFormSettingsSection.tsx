import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  FormGroup,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PollResultsDetail, PollResultsVisibility } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import FormikFormattedInputField from '@/core/ui/forms/FormikInputField/FormikFormattedInputField';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { Caption, Text } from '@/core/ui/typography';
import type { CalloutFormSubmittedValues } from '@/domain/collaboration/callout/CalloutForm/CalloutFormModel';

type PollFormSettingsSectionProps = {
  fieldPrefix: string;
  readOnly?: boolean;
};

const PollFormSettingsSection = ({ fieldPrefix, readOnly = false }: PollFormSettingsSectionProps) => {
  const { t } = useTranslation();
  const { setFieldValue, values, getFieldMeta } = useFormikContext<CalloutFormSubmittedValues>();
  const [open, setOpen] = useState(false);
  const [showMinMaxFields, setShowMinMaxFields] = useState(false);

  const settingsPath = `${fieldPrefix}.settings`;
  const settings = values.framing.poll?.settings;
  const { error } = getFieldMeta(settingsPath);

  const isSingleResponse = settings?.minResponses === 1 && settings?.maxResponses === 1;

  const isHiddenResults = settings?.resultsVisibility === PollResultsVisibility.Hidden;
  const isFullDetail = settings?.resultsDetail === PollResultsDetail.Full;
  const currentMaxResponses = Number(settings?.maxResponses ?? 0) || 0;

  const currentNumberOfOptions = values.framing.poll?.options.length ?? 2;

  const handleMultipleResponseChange = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (readOnly) return;
    if (!checked) {
      setShowMinMaxFields(false);
    }
    setFieldValue(`${settingsPath}.minResponses`, 1);
    setFieldValue(`${settingsPath}.maxResponses`, checked ? 0 : 1);
  };

  const handleHiddenResultsChange = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (readOnly) return;
    setFieldValue(
      `${settingsPath}.resultsVisibility`,
      checked ? PollResultsVisibility.Hidden : PollResultsVisibility.Visible
    );
  };

  const handleShowAvatarsChange = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (readOnly) return;
    setFieldValue(`${settingsPath}.resultsDetail`, checked ? PollResultsDetail.Full : PollResultsDetail.Percentage);
  };

  const handleAllowUserOptionsChange = (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (readOnly) return;
    setFieldValue(`${settingsPath}.allowContributorsAddOptions`, checked);
  };

  const handleMinChoicesLessClick = () => {
    if (readOnly) return;
    setFieldValue(`${settingsPath}.minResponses`, Math.max((values.framing.poll?.settings.minResponses ?? 0) - 1, 1));
  };

  const handleMinChoicesMoreClick = () => {
    if (readOnly) return;
    const newValue = Math.min((values.framing.poll?.settings.minResponses ?? 0) + 1, currentNumberOfOptions);
    setFieldValue(`${settingsPath}.minResponses`, newValue);
    if (settings?.maxResponses && newValue > settings.maxResponses) {
      setFieldValue(`${settingsPath}.maxResponses`, newValue);
    }
  };

  const formatMaxResponses = (value: unknown, { isFocused }: { isFocused: boolean }) => {
    if (value === '' && isFocused) {
      return '';
    }

    const numericValue = Number(value ?? 0);
    if (isFocused) {
      return String(Number.isNaN(numericValue) ? 0 : numericValue);
    }

    return numericValue === 0 ? t('poll.create.infiniteResponses') : String(numericValue);
  };

  const parseMaxResponses = (value: string, { isBlur }: { isBlur: boolean }) => {
    const trimmed = value.trim();
    if (trimmed === '') {
      return isBlur ? 0 : '';
    }

    if (!/^\d+$/.test(trimmed)) {
      return isBlur ? 0 : currentMaxResponses;
    }

    return Math.max(Number(trimmed), 0);
  };

  const handleSetInfiniteResponses = () => {
    if (readOnly) return;
    setFieldValue(`${settingsPath}.maxResponses`, 0);
  };

  const handleMaxChoicesLessClick = () => {
    if (readOnly) return;
    if (currentMaxResponses === 0) return;
    const newValue = currentMaxResponses - 1;
    if (newValue < (values.framing.poll?.settings.minResponses ?? 0)) {
      setFieldValue(`${settingsPath}.maxResponses`, 0);
    } else {
      setFieldValue(`${settingsPath}.maxResponses`, newValue);
    }
  };

  const handleMaxChoicesMoreClick = () => {
    if (readOnly) return;
    const newValue = Math.min(currentMaxResponses + 1, currentNumberOfOptions);
    setFieldValue(`${settingsPath}.maxResponses`, newValue);
  };

  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState(false);
  const handleCloseDialog = () => {
    if (error) {
      setConfirmCloseDialogOpen(true);
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<SettingsOutlinedIcon />}
        onClick={() => setOpen(true)}
        sx={{ alignSelf: 'flex-start', mt: 1 }}
      >
        {t('poll.create.settings')}
      </Button>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogHeader title={t('poll.create.settingsDialogTitle')} onClose={handleCloseDialog} />
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 2, minWidth: 520 }}>
          <Caption>{t('poll.create.votingOptions')}</Caption>
          <FormGroup>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox checked={!isSingleResponse} onChange={handleMultipleResponseChange} disabled={readOnly} />
                }
                label={t('poll.create.allowMultipleResponses')}
              />
              <Tooltip title={t('poll.create.allowMultipleResponsesSettingsTooltip')} arrow={true}>
                <IconButton
                  size="small"
                  onClick={() => setShowMinMaxFields(prev => !prev)}
                  aria-label={t('poll.create.settings')}
                  disabled={readOnly}
                >
                  <SettingsOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Collapse in={showMinMaxFields}>
              <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 1, pb: 1 }}>
                <FormikInputField
                  name={`${settingsPath}.minResponses`}
                  title={t('poll.create.minResponses')}
                  type="number"
                  disabled={readOnly}
                  endAdornment={
                    <>
                      <IconButton size="small" onClick={handleMinChoicesLessClick}>
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={handleMinChoicesMoreClick}>
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </>
                  }
                />
                <FormikFormattedInputField
                  name={`${settingsPath}.maxResponses`}
                  title={t('poll.create.maxResponses')}
                  valueFormatter={formatMaxResponses}
                  valueParser={parseMaxResponses}
                  disabled={readOnly}
                  endAdornment={
                    <>
                      <Tooltip title={t('poll.create.infiniteResponsesTooltip')} arrow={true}>
                        <IconButton size="small" onClick={handleSetInfiniteResponses}>
                          <AllInclusiveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={handleMaxChoicesLessClick}>
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={handleMaxChoicesMoreClick}>
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </>
                  }
                />
              </Box>
            </Collapse>
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings?.allowContributorsAddOptions ?? false}
                  onChange={handleAllowUserOptionsChange}
                  disabled={readOnly}
                />
              }
              label={t('poll.create.allowUserOptions')}
            />
          </FormGroup>

          <Caption>{t('poll.create.displayOptions')}</Caption>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={isHiddenResults} onChange={handleHiddenResultsChange} disabled={readOnly} />}
              label={t('poll.create.onlyShowResultsAfterVoted')}
            />
            <FormControlLabel
              control={<Checkbox checked={isFullDetail} onChange={handleShowAvatarsChange} disabled={readOnly} />}
              label={t('poll.create.showVoterAvatars')}
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Tooltip title={error ? t('poll.create.fixErrorsBeforeClosingTooltip') : ''} arrow={true}>
            <span>
              <Button onClick={handleCloseDialog} variant="contained" disabled={!!error}>
                {t('buttons.close')}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmCloseDialogOpen} onClose={() => setConfirmCloseDialogOpen(false)}>
        <DialogHeader title={t('poll.create.closeConfirm.title')} onClose={() => setConfirmCloseDialogOpen(false)} />
        <DialogContent>
          <Text>{t('poll.create.closeConfirm.message')}</Text>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmCloseDialogOpen(false);
              setOpen(false);
            }}
            variant="text"
          >
            {t('buttons.yesClose')}
          </Button>
          <Button onClick={() => setConfirmCloseDialogOpen(false)} variant="contained">
            {t('buttons.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PollFormSettingsSection;
