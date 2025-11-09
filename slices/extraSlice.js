import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '../services/URL';

export const fetchExtraServices = createAsyncThunk('extraServices/extraServices', async ({ categoryId, orderId, token }) => {
    return await axios
        .get(`${uri}/technician/extra-services`, { 
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
            params: { 
                category_id: categoryId, 
                order_id: orderId 
            }
        })
        .then(response => response?.data)
        .catch(error => {
            console.log(error);
            throw new Error(error.response?.data?.message || error.message);
        })
})

const extraSlice = createSlice({
    name: 'extraServices',
    initialState: {
        loading: false,
        data: [],
        error: '',
        items: [],
    },
    extraReducers: builder => {
        builder.addCase(fetchExtraServices.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchExtraServices.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload?.data
            state.items = action.payload?.items
            state.error = ''
        })
        builder.addCase(fetchExtraServices.rejected, (state, action) => {
            state.loading = false
            state.data = null
            state.error = action.error.message
        })
    },
    reducers: {
        addExtraServices: (state, action) => {
            const newItem = action.payload;
            const existingItemIndex = state.items.findIndex(item => item.id == newItem.id);
            return {
                ...state,
                items: existingItemIndex !== -1
                    ? state.items.map((item, index) =>
                        index == existingItemIndex
                            ? { ...item, price: null, extra_detail_id: null, title: null }
                            : item
                    )
                    : [...state.items, { ...newItem }],
            }
        },

        removeExtraServices: (state, action) => {
            const extraItem = action.payload.id;
            return {
                ...state,
                items: state.items.map(item => {
                    if (item.id == extraItem) {
                        return null;
                    }
                    return item;
                }).filter(item => item !== null),
            };
        },

        updateExtraServicePrice: (state, action) => {
            const { id, price, title, extra_detail_id } = action.payload;
            const existingItemIndex = state.items?.findIndex(item => item.id == id);
            if (existingItemIndex != -1) {
                state.items[existingItemIndex].price = price;
                state.items[existingItemIndex].title = title;
                state.items[existingItemIndex].extra_detail_id = extra_detail_id;
            }
        },

        emptyExtraServices: (state) => {
            state.loading = false;
            state.data = [];
            state.items = [];
            state.error = '';
        },
    }
});

export const { emptyExtraServices, addExtraServices, removeExtraServices, updateExtraServicePrice } = extraSlice.actions;

export default extraSlice.reducer