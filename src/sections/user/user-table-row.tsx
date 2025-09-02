import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import Modal from 'src/components/Modal/Modal';
import { Iconify } from 'src/components/iconify';

import { ParametroProduto, Projeto } from '../productSpecification/view';

// ----------------------------------------------------------------------

export type ProductProps = {
  id: string;
  nome: string;
  tipo: string;
  referencia: string;
  parametros: ParametroProduto[];
  projetos: Projeto[];
  criadoEm: Date;
};

type UserTableRowProps = {
  row: ProductProps;
  selected: boolean;
  onSelectRow: () => void;
  onDelete: () => void;
  onClickView: () => void;
  onEdit: (product: ProductProps) => void;
};

export function UserTableRow({
  row,
  selected,
  onSelectRow,
  onDelete,
  onEdit,
  onClickView,
}: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleDelete = () => {
    onDelete();
    setOpenConfirmDialog(false);
  };

  const handleClickEdit = () => {
    onEdit(row); // Passa o produto para o pai abrir o modal
    handleClosePopover();
  };

  const handleClickDelete = () => {
    setOpenConfirmDialog(true); // Abre o modal
    handleClosePopover(); // Fecha o popover
  };

  return (
    <>
      <TableRow
        hover
        tabIndex={-1}
        role="checkbox"
        selected={selected}
        onClick={onClickView}
        style={{ cursor: 'pointer' }}
      >
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>
        <TableCell align="left" component="th" scope="row">
          {row.nome}
        </TableCell>
        <TableCell align="left">{row.referencia}</TableCell>
        <TableCell align="left">{row.tipo}</TableCell>
        <TableCell align="left">
          {(() => {
            const tiposMedicao =
              row.projetos?.flatMap(
                (proj) =>
                  proj.amostras?.flatMap(
                    (amostra) => amostra.medicoes?.map((m) => m.tipoMedicao) || []
                  ) || []
              ) || [];

            const nomesFormatados = [
              ...new Set(
                tiposMedicao.map((tipo) => {
                  if (tipo === 'ESFERA_INTEGRADORA') return 'Esfera';
                  if (tipo === 'GONIOFOTOMETRO') return 'Gônio';
                  return tipo;
                })
              ),
            ];

            return nomesFormatados.length > 0 ? nomesFormatados.join(' / ') : '-';
          })()}
        </TableCell>
        <TableCell align="left">
          {row.criadoEm ? new Date(row.criadoEm).toLocaleDateString('pt-BR') : '-'}
        </TableCell>
        <TableCell align="center">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

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
          <MenuItem onClick={handleClickEdit}>
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
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleDelete}
        title="Excluir produto?"
        description={`Tem certeza que deseja excluir "${row.nome}"?`}
        confirmText="Excluir"
        confirmColor="error"
      />
    </>
  );
}
