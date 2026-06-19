import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getBrandInfo, createOrUpdateBrandInfo } from '../../services/BrandInfoService';
import type { BrandState } from '../../pages/admin/content/types';

const initialData: BrandState = {
  logo: '', favicon: '', companyName: '', tagline: '',
  phone: '', email: '', address: '', gst: '',
  metaTitle: '', metaDesc: '', ogImage: '', keywords: '',
};

export const fetchBrandInfo = createAsyncThunk('brandInfo/fetch', async () => {
  const res = await getBrandInfo();
  const d = res?.data;
  if (!d) return initialData;
  return {
    logo: d.brand_logo || '',
    favicon: d.favicon || '',
    companyName: d.company_name || '',
    tagline: d.tagline || '',
    phone: d.phone || '',
    email: d.email || '',
    address: d.address || '',
    gst: d.gst || '',
    metaTitle: d.meta_title || '',
    metaDesc: d.meta_description || '',
    ogImage: d.og_image || '',
    keywords: d.meta_keyword || '',
  } as BrandState;
});

export const saveBrandInfo = createAsyncThunk(
  'brandInfo/save',
  async (brand: BrandState) => {
    await createOrUpdateBrandInfo({
      brand_logo: brand.logo,
      favicon: brand.favicon,
      company_name: brand.companyName,
      tagline: brand.tagline,
      phone: brand.phone,
      email: brand.email,
      address: brand.address,
      gst: brand.gst,
      meta_title: brand.metaTitle,
      meta_description: brand.metaDesc,
      og_image: brand.ogImage,
      meta_keyword: brand.keywords,
    });
    return brand;
  }
);

interface BrandInfoSliceState {
  data: BrandState;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: BrandInfoSliceState = {
  data: initialData,
  loading: false,
  saving: false,
  saved: false,
  initialized: false,
  error: null,
};

const brandInfoSlice = createSlice({
  name: 'brandInfo',
  initialState,
  reducers: {
    setBrandField: (state, action: PayloadAction<{ key: keyof BrandState; value: string }>) => {
      state.data[action.payload.key] = action.payload.value;
    },
    clearSaved: (state) => {
      state.saved = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.data = action.payload;
      })
      .addCase(fetchBrandInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load brand info';
      })
      .addCase(saveBrandInfo.pending, (state) => {
        state.saving = true;
        state.saved = false;
        state.error = null;
      })
      .addCase(saveBrandInfo.fulfilled, (state, action) => {
        state.saving = false;
        state.saved = true;
        state.data = action.payload;
      })
      .addCase(saveBrandInfo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to save brand info';
      });
  },
});

export const { setBrandField, clearSaved } = brandInfoSlice.actions;
export default brandInfoSlice.reducer;
