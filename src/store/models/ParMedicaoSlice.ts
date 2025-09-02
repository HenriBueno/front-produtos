import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { doDelete, doGet, doPost, doUpdate } from 'src/services/Api';

import { ParametroProduto, parametrosProduto } from 'src/sections/productSpecification/view';


interface ParMedicaoState {
  parametros: ParametroProduto[];
  loading: boolean;
  error: string | null;
}

const initialState: ParMedicaoState = {
  parametros: [],
  loading: false,
  error: null,
};

// GET
// GET
export const getParametros = createAsyncThunk(
  'parametros/fetch',
  async (
    {
      produtoId,
      projetoId,
      amostraId,
      medicaoId,
    }: { produtoId: string; projetoId: string; amostraId: string; medicaoId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await doGet(
        `/parametro-medicao/${produtoId}/${projetoId}/${amostraId}/${medicaoId}`
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error || 'Erro ao buscar parâmetros');
    }
  }
);

// POST
export const createParametro = createAsyncThunk(
  'parametros/create',
  async (
    {
      produtoId,
      projetoId,
      amostraId,
      medicaoId,
      nome,
      valor,
      unidade,
    }: {
      produtoId: string;
      projetoId: string;
      amostraId: string;
      medicaoId: string;
      nome: string;
      valor: number;
      unidade: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await doPost(
        `/parametro-medicao/${produtoId}/${projetoId}/${amostraId}/${medicaoId}`,
        { nome, valor, unidade }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error || 'Erro ao criar parâmetro');
    }
  }
);

//MULTIPLOS POST
export const createMultipleParametros = createAsyncThunk<
  void,
  {
    produtoId: string;
    projetoId: string;
    amostraId: string;
    medicaoId: string;
  },
  { rejectValue: string }
>(
  'parametros/createMultiple',
  async ({ produtoId, projetoId, amostraId, medicaoId }, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all(
        parametrosProduto.map((param) =>
          dispatch(
            createParametro({
              produtoId,
              projetoId,
              amostraId,
              medicaoId,
              nome: param.key,
              valor: -999,
              unidade: param.unidade,
            })
          )
        )
      );
    } catch (error: any) {
      const message = error || 'Erro ao criar múltiplos parâmetros';
      return rejectWithValue(message);
    }
  }
);

// PUT
// UPDATE único
export const updateParametro = createAsyncThunk(
  'parametros/update',
  async (
    {
      produtoId,
      projetoId,
      amostraId,
      medicaoId,
      id,
      nome,
      valor,
      unidade,
    }: {
      produtoId: string;
      projetoId: string;
      amostraId: string;
      medicaoId: string;
      id: string;
      nome?: string;
      valor: number;
      unidade?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await doUpdate(
        `/parametro-medicao/${produtoId}/${projetoId}/${amostraId}/${medicaoId}/${id}`,
        { nome, valor, unidade }
      );
      console.log(response);
      return response.data;
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(error || 'Erro ao atualizar parâmetro');
    }
  }
);

// UPDATE múltiplo
export const updateMultipleParametros = createAsyncThunk<
  void,
  {
    produtoId: string;
    projetoId: string;
    amostraId: string;
    medicaoId: string;
    parametros: {
      id: string;
      valor: number;
    }[];
  },
  { rejectValue: string }
>(
  'parametros/updateMultiple',
  async (
    { produtoId, projetoId, amostraId, medicaoId, parametros },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await Promise.all(
        parametros.map((param) =>
          dispatch(
            updateParametro({
              produtoId,
              projetoId,
              amostraId,
              medicaoId,
              id: param.id,
              valor: param.valor,
            })
          )
        )
      );
    } catch (error: any) {
      const message = error || 'Erro ao atualizar múltiplos parâmetros';
      return rejectWithValue(message);
    }
  }
);

// DELETE
export const deleteParametro = createAsyncThunk(
  'parametros/delete',
  async (
    {
      produtoId,
      projetoId,
      amostraId,
      medicaoId,
      id,
    }: {
      produtoId: string;
      projetoId: string;
      amostraId: string;
      medicaoId: string;
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await doDelete(
        `/parametro-medicao/${produtoId}/${projetoId}/${amostraId}/${medicaoId}/${id}`
      );
      return id;
    } catch (error: any) {
      return rejectWithValue(error || 'Erro ao excluir parâmetro');
    }
  }
);

// DELETE múltiplo
export const deleteMultipleParametros = createAsyncThunk<
  void,
  {
    produtoId: string;
    projetoId: string;
    amostraId: string;
    medicaoId: string;
    parametrosIds: string[];
  },
  { rejectValue: string }
>(
  'parametros/deleteMultiple',
  async (
    { produtoId, projetoId, amostraId, medicaoId, parametrosIds },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await Promise.all(
        parametrosIds.map((id) =>
          dispatch(
            deleteParametro({
              produtoId,
              projetoId,
              amostraId,
              medicaoId,
              id,
            })
          )
        )
      );
    } catch (error: any) {
      const message = error || 'Erro ao excluir múltiplos parâmetros';
      return rejectWithValue(message);
    }
  }
);

const parametroMedicaoSlice = createSlice({
  name: 'parametros',
  initialState,
  reducers: {
    resetParametros(state) {
      state.parametros = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getParametros.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getParametros.fulfilled, (state, action) => {
        state.loading = false;
        state.parametros = action.payload;
      })
      .addCase(getParametros.rejected, (state, action) => {
        state.loading = false;
        state.error = 'Erro ao buscar parâmetros';
      })
      .addCase(createParametro.fulfilled, (state, action) => {
        state.parametros.push(action.payload);
      })
      .addCase(updateParametro.fulfilled, (state, action) => {
        state.parametros = state.parametros.map((p) =>
          p.id === action.payload.id ? action.payload : p
        );
      })
      .addCase(deleteParametro.fulfilled, (state, action) => {
        state.parametros = state.parametros.filter((p) => p.id !== action.payload);
      });
  },
});

export const { resetParametros } = parametroMedicaoSlice.actions;
export default parametroMedicaoSlice.reducer;
