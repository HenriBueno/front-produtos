import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { doDelete, doGet, doPost } from 'src/services/Api';



type Medicao = {
  id: string;
  tipoMedicao: string;
  amostraId: string;
  criadoEm: Date;
};

type MedicaoState = {
  data: Medicao[];
  loading: boolean;
  success: boolean;
  error: string | null;
};

const initialState: MedicaoState = {
  data: [],
  loading: false,
  success: false,
  error: null,
};

// LIST
export const getMedicoes = createAsyncThunk(
  'medicao/getMedicoes',
  async (
    {
      produtoId,
      projetoId,
      amostraId,
    }: { produtoId: string; projetoId: string; amostraId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await doGet(
        `/medicao/${produtoId}/${projetoId}/${amostraId}`
      );
      
      return response as Medicao[];
    } catch (error: any) {
      return rejectWithValue(error|| 'Erro ao buscar medições');
    }
  }
);


// CREATE
export const createMedicao = createAsyncThunk(
  'medicao/createMedicao',
  async (
    {
      produtoId,
      projetoId,
      amostraId,
      tipoMedicao,
    }: {
      produtoId: string;
      projetoId: string;
      amostraId: string;
      tipoMedicao: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await doPost(
        `/medicao/${produtoId}/${projetoId}/${amostraId}`,
        { tipoMedicao }
      );
      return response.data as Medicao;
    } catch (error: any) {
      return rejectWithValue(error || 'Erro ao criar medição');
    }
  }
);


// UPDATE
export const updateMedicao = createAsyncThunk(
  'medicao/updateMedicao',
  async ({
    produtoId,
    projetoId,
    amostraId,
    medicaoId,
    tipoMedicao,
  }: {
    produtoId: string;
    projetoId: string;
    amostraId: string;
    medicaoId: string;
    tipoMedicao: string;
  }) => {
    const response = await doPost(`/medicao/${produtoId}/${projetoId}/${amostraId}/${medicaoId}`, { tipoMedicao });
    return response.data.data as Medicao;
  }
);

// DELETE
export const deleteMedicao = createAsyncThunk<
  string,
  {
    produtoId: string;
    projetoId: string;
    amostraId: string;
    medicaoId: string;
  },
  { rejectValue: string }
>(
  'medicao/deleteMedicao',
  async ({ produtoId, projetoId, amostraId, medicaoId }, { rejectWithValue }) => {
    try {
      await doDelete(`/medicao/${produtoId}/${projetoId}/${amostraId}/${medicaoId}`);
      return medicaoId; 
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Erro ao deletar medição');
    }
  }
);


const medicaoSlice = createSlice({
  name: 'medicao',
  initialState,
  reducers: {
    resetMedicaoState(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LIST
      .addCase(getMedicoes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicoes.fulfilled, (state, action: PayloadAction<Medicao[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getMedicoes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Erro ao buscar medições';
      })

      // CREATE
      .addCase(createMedicao.fulfilled, (state, action: PayloadAction<Medicao>) => {
        state.data.push(action.payload);
      })

      // UPDATE
      .addCase(updateMedicao.fulfilled, (state, action: PayloadAction<Medicao>) => {
        const index = state.data.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteMedicao.fulfilled, (state, action: PayloadAction<string>) => {
        state.data = state.data.filter((m) => m.id !== action.payload);
      });
  },
});

export const { resetMedicaoState } = medicaoSlice.actions;
export default medicaoSlice.reducer;
