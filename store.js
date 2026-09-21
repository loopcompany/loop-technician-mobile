import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import contactSlice from './slices/contactSlice';
import authSlice from './slices/authSlice';
import languageSlice from './slices/languageSlice';
import extraSlice from './slices/extraSlice';
import orderExtrasSlice from './slices/orderExtrasSlice';
import pdfSlice from './slices/pdfDocumentSlice';
import hashAppSlice from './slices/hashAppSlice';

// Nothing is persisted here: the session is restored from storage on launch
// (see App.js), and user data is refetched, so no token or personal data ends
// up in localStorage.
const store = configureStore({
  reducer: {
    auth: authSlice,
    lang: languageSlice,
    user: userSlice,
    contacts: contactSlice,
    extraServices: extraSlice,
    orderExtras: orderExtrasSlice,
    pdf: pdfSlice,
    hashApp: hashAppSlice,
  },
});

export default store;
