import { configureStore } from '@reduxjs/toolkit';

import productSlice from './models/ProductSlice';
import projetoSlice from './models/ProjectSlice';
import amostraSlice from './models/AmostraSlice';
import medicaoSlice from './models/MedicaoSlice';
import parProductSlice from './models/ParProductSlice';
import parMedicaoSlice from './models/ParMedicaoSlice';

export const store = configureStore({
  reducer: {
    products: productSlice,
    parProduct: parProductSlice,
    project: projetoSlice,
    amostra: amostraSlice,
    medicao: medicaoSlice,
    parMedicao: parMedicaoSlice,
    // adicione outros reducers aqui
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
