import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrderExtras } from '../services/Api';

export const fetchOrderExtras = createAsyncThunk(
    'orderExtras/fetchOrderExtras',
    async (orderId, { rejectWithValue }) => {
        try {
            const result = await getOrderExtras(orderId);
            console.log('🎯 fetchOrderExtras result:', result);
            if (result.success) {
                // API برمی‌گرداند extra_services
                const extras = result.data?.extra_services || result.data || [];
                console.log('✅ خدمات اضافی دریافت شد:', extras);
                return Array.isArray(extras) ? extras : [];
            } else {
                return rejectWithValue(result.message || 'خطا در دریافت خدمات اضافی');
            }
        } catch (error) {
            return rejectWithValue(error.message || 'خطا در دریافت خدمات اضافی');
        }
    }
);

const orderExtrasSlice = createSlice({
    name: 'orderExtras',
    initialState: {
        loading: false,
        data: [],
        error: null,
    },
    reducers: {
        clearOrderExtras: (state) => {
            state.loading = false;
            state.data = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderExtras.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderExtras.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderExtras.rejected, (state, action) => {
                state.loading = false;
                state.data = [];
                state.error = action.payload;
            });
    },
});

export const { clearOrderExtras } = orderExtrasSlice.actions;

export default orderExtrasSlice.reducer;
