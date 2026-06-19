import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const loaderSlice = createSlice({
  name: 'loader',
  initialState: { loading: false },
  reducers: {
    loadingActionHandler: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { loadingActionHandler } = loaderSlice.actions;
export default loaderSlice.reducer;
