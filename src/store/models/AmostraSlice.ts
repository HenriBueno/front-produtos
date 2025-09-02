import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { doDelete, doGet, doPost, doUpdate } from 'src/services/Api';

import { Amostra } from 'src/sections/productSpecification/view';



export type AmostraState = {
  data: Amostra[];
  loading: boolean;
  success: boolean;
  error: string | null;
};

const initialState: AmostraState = {
  data: [],
  success: false,
  loading: false,
  error: null,
};

export const getAmostras = createAsyncThunk(
  'amostras/getAmostras',
  async (
    { produtoId, projetoId }: { produtoId: string; projetoId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await doGet(`/amostra/${produtoId}/${projetoId}`);
      return response as Amostra[];
    } catch (error: any) {
      return rejectWithValue(error || 'Erro ao buscar amostras');
    }
  }
);


export const createAmostra = createAsyncThunk(
  'amostras/createAmostra',
  async (
    {
      produtoId,
      projetoId,
      codigo,
    }: {
      produtoId: string;
      projetoId: string;
      codigo: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await doPost(`/amostra/${produtoId}/${projetoId}`, { codigo });
      return response.data;
    } catch (error: any) {
      const msg = error || 'Erro desconhecido ao criar amostra';
      return rejectWithValue(msg);
    }
  }
);


export const updateAmostra = createAsyncThunk(
  'amostras/updateAmostra',
  async ({
    produtoId,
    projetoId,
    amostraId,
    codigo,
  }: {
    produtoId: string;
    projetoId: string;
    amostraId: string;
    codigo: string;
  }) => {
    const response = await doUpdate (`/amostra/${produtoId}/${projetoId}/${amostraId}`, { codigo });
    return response.data.data as Amostra;
  }
);

export const deleteAmostra = createAsyncThunk(
  'amostras/deleteAmostra',
  async (
    {
      produtoId,
      projetoId,
      amostraId,
    }: {
      produtoId: string;
      projetoId: string;
      amostraId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await doDelete(`/amostra/${produtoId}/${projetoId}/${amostraId}`);
      return amostraId;
    } catch (error: any) {
      const msg = error || 'Erro desconhecido ao deletar amostra';
      return rejectWithValue(msg);
    }
  }
);


const amostraSlice = createSlice({
  name: 'amostras',
  initialState,
  reducers: {
    resetAmostraCreate(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LIST
      .addCase(getAmostras.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getAmostras.fulfilled, (state, action: PayloadAction<Amostra[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getAmostras.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Erro ao buscar amostras';
      })

      // CREATE
      .addCase(createAmostra.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createAmostra.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(createAmostra.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      // UPDATE
      .addCase(updateAmostra.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateAmostra.fulfilled, (state, action: PayloadAction<Amostra>) => {
        state.loading = false;
        state.success = true;
        const index = state.data.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateAmostra.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error.message ?? 'Erro ao atualizar amostra';
      })

      // DELETE
      .addCase(deleteAmostra.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteAmostra.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.success = true;
        state.data = state.data.filter((a) => a.id !== action.payload);
      })
      .addCase(deleteAmostra.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error.message ?? 'Erro ao deletar amostra';
      });
  },
});

export const { resetAmostraCreate } = amostraSlice.actions;
export default amostraSlice.reducer;
