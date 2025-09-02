import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { converterNumeroComVirgula } from 'src/utils/format-number';

import { parametrosProduto } from 'src/sections/productSpecification/view';

import { doPost, doUpdate } from '../../services/Api';

export type ParProductProps = {
  id: string;
  nome: string;
  valor: number;
  unidade: string;
};

interface ParCreateState {
  loading: boolean;
  success: boolean;
  error: string | null;
  items: ParProductProps[];
  selected: ParProductProps | null;
}

const initialState: ParCreateState = {
  loading: false,
  success: false,
  error: null,
  selected: null,
  items: [],
};

export const createParProduct = createAsyncThunk<
  ParProductProps,
  { productId: string; nome: string; valor: number; unidade: string },
  { rejectValue: string }
>('ParameterProduct/create', async (parProductData, { rejectWithValue }) => {
  const { productId, ...paramData } = parProductData;
  try {
    const response = await doPost(`/parametroProduto/${productId}`, paramData);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Erro ao criar parâmetro';
    return rejectWithValue(message);
  }
});

export const createMultipleParProduct = createAsyncThunk<
  void,
  { productId: string },
  { rejectValue: string }
>('ParameterProduct/createMultiple', async ({ productId }, { dispatch, rejectWithValue }) => {
  try {
    await Promise.all(
      parametrosProduto.map((param) =>
        dispatch(
          createParProduct({
            productId,
            nome: param.key,
            valor: -999,
            unidade: param.unidade,
          })
        )
      )
    );
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Erro ao criar múltiplos parâmetros';
    return rejectWithValue(message);
  }
});

export const updateParProduct = createAsyncThunk<
  ParProductProps,
  { produtoId: string; parametroId: string; valor: number | string },
  { rejectValue: string }
>('ParameterProduct/update', async ({ produtoId, parametroId, valor }, { rejectWithValue }) => {
  try {
    const valorTratado = converterNumeroComVirgula(valor);
    const response = await doUpdate(`/parametroProduto/${produtoId}/${parametroId}`, {
      valor: valorTratado,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Erro ao atualizar parâmetro';
    return rejectWithValue(message);
  }
});

export const updateMultipleParProduct = createAsyncThunk<
  void,
  { produtoId: string; parametros: { id: string; valor: number | string }[] },
  { rejectValue: string }
>(
  'ParameterProduct/updateMultiple',
  async ({ produtoId, parametros }, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all(
        parametros.map((param) =>
          dispatch(
            updateParProduct({
              produtoId,
              parametroId: param.id,
              valor: param.valor,
            })
          )
        )
      );
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Erro ao atualizar múltiplos parâmetros';
      return rejectWithValue(message);
    }
  }
);

const parProductSlice = createSlice({
  name: 'ParameterProduct',
  initialState,
  reducers: {
    resetParProductCreate(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE PARAMETRO
      .addCase(createParProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createParProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.items.push(action.payload);
      })

      // UPDATE PARAMETRO
      .addCase(createParProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      .addCase(updateParProduct.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((p) => p.id === updated.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
        state.loading = false;
        state.success = true;
        state.error = null;
      });
  },
});

export const { resetParProductCreate } = parProductSlice.actions;
export default parProductSlice.reducer;
