import { useCallback, useState } from 'react';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import {
  IconButton,
  MenuItem,
  menuItemClasses,
  MenuList,
  Popover,
  TextField,
  Typography,
} from '@mui/material';

import Modal from 'src/components/Modal/Modal';
import { Iconify } from 'src/components/iconify';


type Column = {
  label: string;
  key: string;
};

type ProductSpecificationTableProps = {
  title?: string;
  columns?: Column[];
  rows?: Record<string, any>[];
  editMode?: boolean;
  onChange?: (updatedRows: Record<string, any>[]) => void;
  onDelete?: (row: Record<string, any>) => void;
  onEdit?: (row: Record<string, any>) => void;
  onRowClick?: (row: Record<string, any>) => void;
  showPopoverActions?: boolean;
};

export default function ProductSpecificationTable({
  title,
  columns = [],
  rows = [],
  editMode = false,
  onChange,
  onDelete,
  onEdit,
  onRowClick,
  showPopoverActions = false,
}: ProductSpecificationTableProps) {
  const [openPopover, setOpenPopover] = useState<null | HTMLElement>(null);
  const [popoverRowIndex, setPopoverRowIndex] = useState<number | null>(null);
  const [rowParaDeletar, setRowParaDeletar] = useState<any>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleChange = (rowIdx: number, key: string, value: any) => {
    const updated = [...rows];
    updated[rowIdx] = { ...updated[rowIdx], [key]: value };
    onChange?.(updated);
  };
  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
      event.stopPropagation();
      setOpenPopover(event.currentTarget);
      setPopoverRowIndex(index);
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
    setPopoverRowIndex(null);
  }, []);

  const handleClickDelete = () => {
    const rowSelecionada = popoverRowIndex !== null ? rows[popoverRowIndex] : null;
    setRowParaDeletar(rowSelecionada);
    handleClosePopover();
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (rowParaDeletar && onDelete) {
      onDelete(rowParaDeletar);
    }

    setOpenConfirmDialog(false);
    setRowParaDeletar(null);
  };
  return (
    <TableContainer component={Paper}>
      <Table sx={{ width: '100%' }} aria-label="generic table">
        {columns.length > 0 && (
          <TableHead>
            {title && (
              <Typography variant="h6" gutterBottom>
                {title}
              </Typography>
            )}

            <TableRow>
              {columns.map((col, idx) => (
                <TableCell key={idx}>{col.label}</TableCell>
              ))}
              {showPopoverActions && <TableCell />}
            </TableRow>
          </TableHead>
        )}

        {/* Corpo */}
        <TableBody>
          {rows.map((row, rowIdx) => (
            <TableRow
              key={rowIdx}
              hover
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, colIdx) => {
                const isValor = col.key === 'valor';
                return (
                  <TableCell
                    key={colIdx}
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {isValor ? (
                      <TextField
                        variant="outlined"
                        slotProps={{
                          input: {
                            inputProps: {
                              pattern: '[0-9.,]*',
                              inputMode: 'decimal',
                            },
                          },
                        }}
                        size="small"
                        fullWidth
                        disabled={!editMode}
                        value={row[col.key] === -999 ? '-' : (row[col.key] ?? '')}
                        onChange={(e) => handleChange(rowIdx, col.key, e.target.value)}
                        sx={{ width: '100px', height: '25px' }}
                      />
                    ) : (
                       row[col.key] === -999 ? '-' : (row[col.key] ?? '-')
                    )}
                  </TableCell>
                );
              })}

              {showPopoverActions && (
                <TableCell>
                  <IconButton onClick={(e) => handleOpenPopover(e, rowIdx)}>
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}

          <Popover
            open={!!openPopover}
            anchorEl={openPopover}
            onClose={handleClosePopover}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuList
              disablePadding
              sx={{
                p: 0.5,
                gap: 0.5,
                width: 140,
                display: 'flex',
                flexDirection: 'column',
                [`& .${menuItemClasses.root}`]: {
                  px: 1,
                  gap: 2,
                  borderRadius: 0.75,
                  [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  if (popoverRowIndex !== null) {
                    onEdit?.(rows[popoverRowIndex]);
                    handleClosePopover();
                  }
                }}
              >
                <Iconify icon="solar:pen-bold" />
                Editar
              </MenuItem>

              <MenuItem onClick={handleClickDelete} sx={{ color: 'error.main' }}>
                <Iconify icon="solar:trash-bin-trash-bold" />
                Deletar
              </MenuItem>
            </MenuList>
          </Popover>
          <Modal
            open={openConfirmDialog}
            onClose={() => {
              setOpenConfirmDialog(false);
              setRowParaDeletar(null);
            }}
            title="Excluir produto?"
            onConfirm={handleConfirmDelete}
            description={
              rowParaDeletar
                ? `Tem certeza que deseja excluir o projeto "${rowParaDeletar.projeto}"?`
                : 'Tem certeza que deseja excluir este item?'
            }
            confirmText="Excluir"
            confirmColor="error"
          />

          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                Nenhum dado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
