import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ProductProps } from 'src/sections/user/user-table-row';

import { doDelete, doPost, doGet, doUpdate } from '../../services/Api';

interface ProductCreateState {
  loading: boolean;
  success: boolean;
  error: string | null;
  items: ProductProps[];
  selected: ProductProps | null;
}

const initialState: ProductCreateState = {
  loading: false,
  selected: null,
  success: false,
  error: null,
  items: [],
};

export const createProduct = createAsyncThunk(
  'products/create',
  async (productData: { nome: string; tipo: string; referencia: string }, { rejectWithValue }) => {
    try {
      const response = await doPost('/produtos', productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await doDelete(`/produtos/${productId}`);
      return productId; // retorna o id para remover do estado
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao deletar produto');
    }
  }
);

export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await doGet('/produtos');
      return response;
    } catch (error: any) {
      // captura mensagem do backend (se existir) ou erro padrão
      const message = error.response?.data?.message || error.message || 'Erro desconhecido';
      return rejectWithValue(message);
    }
  }
);

export const showProduct = createAsyncThunk(
  'products/showProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await doGet(`/produtos/${productId}`);

      return response;
    } catch (error: any) {
      const message = error.response?.data?.msg || error.message || 'Erro desconhecido';
      return rejectWithValue(message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async (
    {
      productId,
      data,
    }: { productId: string; data: { nome: string; tipo: string; referencia: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await doUpdate(`/produtos/${productId}`, data);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.msg || error.message || 'Erro ao atualizar produto';
      return rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    resetProductCreate(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE PRODUCT
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      // DELETE PRODUCT
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      //GET PRODUCT
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Erro ao carregar produtos';
      })

      //SHOW PRODUCT
      .addCase(showProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(showProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(showProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Erro ao carregar o produto';
      })

      //UPDATE PRODUCT
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((p) => p.id === updated.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
        state.loading = false;
        state.success = true;
        state.error = null;
      })

      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProductCreate } = productSlice.actions;
export default productSlice.reducer;
