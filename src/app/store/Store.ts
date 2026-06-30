import { configureStore } from '@reduxjs/toolkit';
import loaderReducer from './slice/Loader';
import brandInfoReducer from './slice/BrandInfoSlice';
import contactReducer from './slice/ContactSlice';
import permissionReducer from './slice/PermissionSlice';

const store = configureStore({
  reducer: {
    loader: loaderReducer,
    brandInfo: brandInfoReducer,
    contact: contactReducer,
    permission: permissionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
