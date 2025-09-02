import { useEffect, useMemo } from 'react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { Alert, Backdrop, CircularProgress, Snackbar } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { createMultipleParProduct } from 'src/store/models/ParProductSlice';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from 'src/store/models/ProductSlice';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import GenericForm from 'src/components/Formulário/Form';

import { ParametroProduto, Projeto } from 'src/sections/productSpecification/view';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { ProductProps } from '../user-table-row';

// ----------------------------------------------------------------------

export interface ProdutoFormData {
  nome: string;
  tipo: string;
  referencia: string;
  parametros: ParametroProduto[];
  projetos: Projeto[];
}

export function UserView() {
  const dispatch = useAppDispatch();
  const { items: products, loading, error, items } = useAppSelector((state) => state.products);
  console.log('items', items);
  const [OpenModalForm, setOpenModalForm] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const navigate = useNavigate();
  const handleOpenModalForm = () => setOpenModalForm(true);
  const openSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = (data: ProdutoFormData) => {
    dispatch(createProduct(data)).then((result) => {
      if (createProduct.fulfilled.match(result)) {
        const productId = result.payload.id;

        dispatch(createMultipleParProduct({ productId })).then((paramsResult) => {
          if (createMultipleParProduct.fulfilled.match(paramsResult)) {
            dispatch(getProducts());
            setOpenModalForm(false);
            openSnackbar('Produto criado com sucesso!', 'success');
          } else {
            openSnackbar('Produto criado, mas houve erro nos parâmetros.', 'error');
          }
        });
        setIsRedirecting(true);
        setTimeout(() => {
          navigate(`/produtos/${productId}`);
        }, 1000);
      } else {
        const errorMsg = result.payload as string;
        openSnackbar(errorMsg || 'Erro ao criar produto.', 'error');
      }
    });
  };

  const handleDeleteProduct = (id: string) => {
    dispatch(deleteProduct(id)).then((result) => {
      if (deleteProduct.fulfilled.match(result)) {
        openSnackbar('Produto deletado com sucesso!', 'success');
        dispatch(getProducts());
      } else {
        openSnackbar('Erro ao deletar produto.', 'error');
      }
    });
  };

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const table = useTable();

  const [filterName, setFilterName] = useState('');

  const dataFiltered: ProductProps[] = applyFilter({
    inputData: products,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const [openEditForm, setOpenEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductProps | null>(null);

  const initialValues = useMemo(() => {
    return {
      nome: editingProduct?.nome ?? '',
      tipo: editingProduct?.tipo ?? 'JARDIM',
      referencia: editingProduct?.referencia ?? '',
      parametros: Array.isArray(editingProduct?.parametros) ? editingProduct!.parametros : [],
      projetos: Array.isArray(editingProduct?.projetos) ? editingProduct!.projetos : [],
    };
  }, [editingProduct]);

  const handleEdit = (product: ProductProps) => {
    setEditingProduct(product);
    setOpenEditForm(true);
  };

  const handleCloseEditForm = () => {
    setOpenEditForm(false);
    setEditingProduct(null);
  };

  const handleSubmitEdit = (data: ProdutoFormData) => {
    if (!editingProduct) return;

    dispatch(updateProduct({ productId: editingProduct.id, data }))
      .unwrap()
      .then(() => {
        openSnackbar('Produto editado com sucesso!', 'success');
        handleCloseEditForm();
        dispatch(getProducts());
      })
      .catch(() => {
        openSnackbar('Erro ao editar o produto.', 'error');
      });
  };

  return (
    <DashboardContent>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        open={isRedirecting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Produtos
        </Typography>
        <Button
          sx={{ height: '50%', width: '170px' }}
          variant="outlined"
          size="large"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModalForm}
        >
          Add Produto
        </Button>

        <GenericForm<ProdutoFormData>
          onSubmit={handleSubmit}
          open={OpenModalForm}
          initialValues={initialValues}
          onClose={() => setOpenModalForm(false)}
          title="Criar Produto"
          fields={[
            { name: 'nome', label: 'Nome', required: true },
            {
              name: 'tipo',
              label: 'Classificação do produto',
              required: true,
              type: 'select',
              options: [
                { label: 'Jardim', value: 'JARDIM' },
                { label: 'Fonte', value: 'FONTE' },
                { label: 'Fita', value: 'FITA' },
                { label: 'Lâmpada', value: 'LAMPADA' },
              ],
            },
            { name: 'referencia', label: 'Referência', required: true },
          ]}
        />
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={products.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    products.map((p) => p.id)
                  )
                }
                headLabel={[
                  { id: 'nome', label: 'Descrição', align: 'left' },
                  { id: 'referencia', label: 'Referência', align: 'left' },
                  { id: 'tipo', label: 'Tipo', align: 'left' },
                  { id: 'medicao', label: 'Medição', align: 'left' },
                  { id: 'criadoEm', label: 'Criado em', align: 'left' },
                  { id: '', label: 'Opções', width: '20px', align: 'center' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDelete={() => handleDeleteProduct(row.id)}
                      onClickView={() => navigate(`/produtos/${row.id}`)}
                      onEdit={handleEdit}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, products.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
          {!loading && error && items.length === 0 && (
            <Typography color="error" sx={{ p: 2, textAlign: 'center' }}>
              Ocorreu um erro ao carregar os produtos!
              <br />
              Por favor, fale com o Desenvolvedor.
            </Typography>
          )}
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={products.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          labelRowsPerPage="Produtos por página"
          slotProps={{
            actions: {
              previousButton: {
                title: 'Página anterior',
                'aria-label': 'Página anterior',
              },
              nextButton: {
                title: 'Próxima página',
                'aria-label': 'Próxima página',
              },
            },
          }}
        />
      </Card>
      {editingProduct && (
        <GenericForm<ProdutoFormData>
          onSubmit={handleSubmitEdit}
          open={openEditForm}
          onClose={handleCloseEditForm}
          title="Editar Produto"
          initialValues={initialValues}
          fields={[
            { name: 'nome', label: 'Nome', required: true },
            {
              name: 'tipo',
              label: '',
              required: true,
              type: 'select',
              options: [
                { label: 'Jardim', value: 'JARDIM' },
                { label: 'Fonte', value: 'FONTE' },
                { label: 'Fita', value: 'FITA' },
                { label: 'Lâmpada', value: 'LAMPADA' },
              ],
            },
            { name: 'referencia', label: 'Referência', required: true },
          ]}
        />
      )}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('nome');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
