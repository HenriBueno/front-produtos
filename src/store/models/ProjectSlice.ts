import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { Amostra } from 'src/sections/productSpecification/view';

import { doDelete, doGet, doPost, doUpdate } from '../../services/Api';

export type ProjetoFormValues = {
  id: string;
  numero: string;
};

export type ProjectProps = {
  id: string;
  numero: string;
  amostras?: Amostra[] | undefined;
};

interface ProjectCreateState {
  loading: boolean;
  success: boolean;
  error: string | null;
  selected: ProjectProps | null;
  items: ProjectProps[];
}

const initialState: ProjectCreateState = {
  loading: false,
  success: false,
  error: null,
  selected: null,
  items: [],
};

export const getProject = createAsyncThunk(
  'ProjectProduct/get',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await doGet(`/projeto/${productId}`);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro desconhecido';
      return rejectWithValue(message);
    }
  }
);

export const showProject = createAsyncThunk(
  'ProjectProduct/show',
  async (
    { productId, data }: { productId: string; data: { projetoId: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await doGet(`/projeto/${productId}/${data.projetoId}`);
      return response;
    } catch (error: any) {
      const message = error || 'Erro desconhecido';
      return rejectWithValue(message);
    }
  }
);

export const createProject = createAsyncThunk(
  'ProjectProduct/create',
  async (
    { productId, data }: { productId: string; data: { numero: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await doPost(`/projeto/${productId}`, { numero: data.numero });
      return response;
    } catch (error: any) {
      const message = error || 'Erro ao criar projeto';
      console.log(message);
      return rejectWithValue(message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'ProjectProduct/update',
  async (
    { productId, data }: { productId: string; data: { projetoId: string; numero: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await doUpdate(`/projeto/${productId}/${data.projetoId}`, {
        numero: data.numero,
      });
      return response;
    } catch (error: any) {
      const message = error || 'Erro ao atualizar projeto';
      return rejectWithValue(message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'Project/delete',
  async (
    { productId, data }: { productId: string; data: { projetoId: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await doDelete(`/projeto/${productId}/${data.projetoId}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao deletar o projeto');
    }
  }
);

const projetoSlice = createSlice({
  name: 'projeto',
  initialState,
  reducers: {
    resetProjectCreate(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      // DELETE PRODUCT
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      //GET PRODUCT
      .addCase(getProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProject.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getProject.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Erro ao carregar produtos';
      })

      //SHOW PRODUCT
      .addCase(showProject.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(showProject.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(showProject.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Erro ao carregar o produto';
      })

      //UPDATE PRODUCT
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((p) => p.id === updated.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
        state.loading = false;
        state.success = true;
        state.error = null;
      })

      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProjectCreate } = projetoSlice.actions;
export default projetoSlice.reducer;
