import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  Button,
  IconButton,
} from '@mui/material';
import { BlockTitle } from '@/core/ui/typography';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { DataPoint } from './types';

export interface PropertyTableProps {
  nodeName: string;
  properties: DataPoint[];
  editingProperty?: { nodeName: string; index: number; data: DataPoint } | null;
  isPropertyEditing?: (nodeName: string, index: number) => boolean;
  onEdit?: (nodeName: string, index: number, prop) => void;
  onSave?: (nodeName: string, index: number) => void;
  onDelete?: (nodeName: string, index: number) => void;
  onAdd?: (nodeName: string) => void;
  onCancel?: () => void;
  onFieldChange?: (field: string, value) => void;
  readOnly?: boolean;
}

export const PropertyTable = ({
  nodeName,
  properties,
  editingProperty = null,
  isPropertyEditing = () => false,
  onEdit = () => {},
  onSave = () => {},
  onDelete = () => {},
  onAdd = () => {},
  onCancel = () => {},
  onFieldChange = () => {},
  readOnly = false,
}: PropertyTableProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ marginTop: 2 }}>
      <BlockTitle variant="h6">
        {t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.title')}
      </BlockTitle>
      <TableContainer component={Paper} sx={{ marginTop: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.columns.name')}
              </TableCell>
              <TableCell>
                {t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.columns.type')}
              </TableCell>
              <TableCell>
                {t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.columns.optional')}
              </TableCell>
              <TableCell>
                {t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.columns.description')}
              </TableCell>
              <TableCell>
                {t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.columns.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((prop, idx) => {
              const isEditing = !readOnly && isPropertyEditing(nodeName, idx);
              const displayData = isEditing ? editingProperty!.data : prop;

              return (
                <TableRow key={idx}>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={displayData.name || ''}
                        onChange={e => onFieldChange('name', e.target.value)}
                        fullWidth
                      />
                    ) : (
                      prop.name || 'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Select
                        size="small"
                        defaultValue={displayData.type || 'string'}
                        value={displayData.type || 'string'}
                        onChange={e => onFieldChange('type', e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="string">
                          {t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.typeOptions.string')}
                        </MenuItem>
                      </Select>
                    ) : (
                      prop.type || 'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Checkbox
                        checked={displayData.optional || false}
                        onChange={e => onFieldChange('optional', e.target.checked)}
                      />
                    ) : prop.optional ? (
                      t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.yes')
                    ) : (
                      t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.no')
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={displayData.description || ''}
                        onChange={e => onFieldChange('description', e.target.value)}
                        fullWidth
                        multiline
                      />
                    ) : (
                      prop.description ||
                      t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.notAvailable')
                    )}
                  </TableCell>
                  <TableCell>
                    {!readOnly ? (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {isEditing ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => onSave(nodeName, idx)}
                              color="primary"
                              disabled={
                                !(
                                  editingProperty &&
                                  editingProperty.data &&
                                  (editingProperty.data.name || '').trim() &&
                                  (editingProperty.data.type || '').trim() &&
                                  (editingProperty.data.description || '').trim()
                                )
                              }
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={onCancel} color="inherit">
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton size="small" onClick={() => onEdit(nodeName, idx, prop)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => onDelete(nodeName, idx)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {!readOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: 1 }}>
          <Button variant="outlined" size="small" onClick={() => onAdd(nodeName)}>
            {`+ ${t('pages.virtualContributorProfile.settings.promptGraph.propertyTable.addProperty')}`}
          </Button>
        </Box>
      )}
    </Box>
  );
};
