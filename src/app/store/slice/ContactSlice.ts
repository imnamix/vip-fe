import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getAllContacts, createContact, updateContact } from '../../services/ContactService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BannerSlide { id: number; image: string; title: string; description: string }

export interface Address {
  officeNumber: string; building: string; landmark: string; street: string;
  city: string; state: string; pincode: string; country: string;
}

export interface SocialLinks { facebook: string; instagram: string; youtube: string; x: string; linkedin: string }

export interface ContactData {
  recordId: number | null;
  slides: BannerSlide[];
  contactNumber: string;
  whatsappNumber: string;
  officeEmail: string;
  alternateOfficeEmail: string;
  address: Address;
  workingHours: string;
  gstNumber: string;
  googleMapLink: string;
  socialLinks: SocialLinks;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const defaultAddress: Address = { officeNumber: '', building: '', landmark: '', street: '', city: '', state: '', pincode: '', country: '' };
const defaultSocialLinks: SocialLinks = { facebook: '', instagram: '', youtube: '', x: '', linkedin: '' };

const initialContactData: Omit<ContactData, 'recordId'> = {
  slides: [{ id: Date.now(), image: '', title: '', description: '' }],
  contactNumber: '', whatsappNumber: '', officeEmail: '', alternateOfficeEmail: '',
  address: defaultAddress, workingHours: '', gstNumber: '', googleMapLink: '',
  socialLinks: defaultSocialLinks,
};

interface ContactSliceState {
  data: ContactData;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  savingSlides: boolean;
  savedSlides: boolean;
  initialized: boolean;
  error: string | null;
  slidesError: string | null;
}

const initialState: ContactSliceState = {
  data: { recordId: null, ...initialContactData },
  loading: false,
  saving: false,
  saved: false,
  savingSlides: false,
  savedSlides: false,
  initialized: false,
  error: null,
  slidesError: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchContact = createAsyncThunk('contact/fetch', async () => {
  const res = await getAllContacts(1, 1);
  return res?.data?.[0] ?? null;
});

export const saveContactSlides = createAsyncThunk(
  'contact/saveSlides',
  async ({ slides, recordId }: { slides: BannerSlide[]; recordId: number | null }) => {
    const bannerSlides = slides.map(({ id: _id, ...rest }) => rest);
    if (recordId) {
      await updateContact({ bannerSlides }, recordId);
      return recordId;
    } else {
      const res = await createContact({ bannerSlides });
      return res?.data?.id ?? null as number | null;
    }
  }
);

export const saveContact = createAsyncThunk(
  'contact/save',
  async ({ data }: { data: ContactData }) => {
    const { recordId, slides, ...rest } = data;
    const apiPayload = { ...rest, bannerSlides: slides.map(({ id: _id, ...s }) => s) };
    if (recordId) {
      await updateContact(apiPayload, recordId);
      return recordId;
    } else {
      const res = await createContact(apiPayload);
      return res?.data?.id ?? null as number | null;
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    setSlides: (state, action: PayloadAction<BannerSlide[]>) => {
      state.data.slides = action.payload;
    },
    setContactField: (
      state,
      action: PayloadAction<{ key: keyof Omit<ContactData, 'recordId' | 'slides' | 'address' | 'socialLinks'>; value: string }>
    ) => {
      (state.data as any)[action.payload.key] = action.payload.value;
    },
    setAddressField: (state, action: PayloadAction<{ key: keyof Address; value: string }>) => {
      state.data.address[action.payload.key] = action.payload.value;
    },
    setSocialLinkField: (state, action: PayloadAction<{ key: keyof SocialLinks; value: string }>) => {
      state.data.socialLinks[action.payload.key] = action.payload.value;
    },
    clearContactSaved: (state) => { state.saved = false; },
    clearSlidesSaved: (state) => { state.savedSlides = false; },
    clearContactError: (state) => { state.error = null; },
    clearSlidesError: (state) => { state.slidesError = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchContact.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchContact.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        const record = action.payload;
        if (!record) return;
        state.data.recordId = record.id ?? null;
        state.data.slides = record.bannerSlides?.length
          ? record.bannerSlides.map((s: any, i: number) => ({ id: Date.now() + i, image: s.image ?? '', title: s.title ?? '', description: s.description ?? '' }))
          : [{ id: Date.now(), image: '', title: '', description: '' }];
        state.data.contactNumber = record.contactNumber ?? '';
        state.data.whatsappNumber = record.whatsappNumber ?? '';
        state.data.officeEmail = record.officeEmail ?? '';
        state.data.alternateOfficeEmail = record.alternateOfficeEmail ?? '';
        state.data.address = { ...defaultAddress, ...(record.address ?? {}) };
        state.data.workingHours = typeof record.workingHours === 'string' ? record.workingHours : '';
        state.data.gstNumber = record.gstNumber ?? '';
        state.data.googleMapLink = record.googleMapLink ?? '';
        state.data.socialLinks = { ...defaultSocialLinks, ...(record.socialLinks ?? {}) };
      })
      .addCase(fetchContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load contact data';
      })
      // save slides
      .addCase(saveContactSlides.pending, (state) => { state.savingSlides = true; state.savedSlides = false; state.slidesError = null; })
      .addCase(saveContactSlides.fulfilled, (state, action) => {
        state.savingSlides = false;
        state.savedSlides = true;
        if (action.payload !== null) state.data.recordId = action.payload;
      })
      .addCase(saveContactSlides.rejected, (state, action) => {
        state.savingSlides = false;
        state.slidesError = action.error.message || 'Failed to save banner slides';
      })
      // save all
      .addCase(saveContact.pending, (state) => { state.saving = true; state.saved = false; state.error = null; })
      .addCase(saveContact.fulfilled, (state, action) => {
        state.saving = false;
        state.saved = true;
        if (action.payload !== null) state.data.recordId = action.payload;
      })
      .addCase(saveContact.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to save contact data';
      });
  },
});

export const {
  setSlides, setContactField, setAddressField, setSocialLinkField,
  clearContactSaved, clearSlidesSaved, clearContactError, clearSlidesError,
} = contactSlice.actions;

export default contactSlice.reducer;
