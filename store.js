import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import contactSlice from './slices/contactSlice';
import authSlice from './slices/authSlice';
import languageSlice from './slices/languageSlice';
import weightSlice from './slices/weightSlice';
import newUserSlice from './slices/newUserSlice';
import extraSlice from './slices/extraSlice';
import orderExtrasSlice from './slices/orderExtrasSlice';
import { Platform } from 'react-native';
import pdfSlice from './slices/pdfDocumentSlice';
import minPriceSlice from './slices/minPriceSlice';
const loadState = () => {
  if (Platform.OS !== 'web') {
    return undefined;
  }

  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.log('Error loading state from localStorage:', error);
    return undefined;
  }
};

const saveState = (state) => {
  if (Platform.OS !== 'web') {
    return;
  }

  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('reduxState', serializedState);
  } catch (error) {
    console.log('Error saving state to localStorage:', error);
  }
};

// Load persisted state before store creation
const preloadedState = loadState();

const store = configureStore({
  reducer: {
    auth: authSlice,
    lang: languageSlice,
    user: userSlice,
    contacts: contactSlice,
    weight: weightSlice,
    newUser: newUserSlice,
    extraServices: extraSlice,
    orderExtras: orderExtrasSlice,
    pdf: pdfSlice,
    minPrice: minPriceSlice,
  },
  preloadedState
})
if (Platform.OS === 'web') {
  store.subscribe(() => {
    saveState(store.getState());
  });
}


export default store;