import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/Api';

// Payload keeps the raw response body; screens read state.user.data.data.technician.
// The token argument is optional: the api client attaches the session token.
export const fetchUser = createAsyncThunk('user/fetchUser', async (token, { rejectWithValue }) => {
    try {
        const response = await api.post(
            '/technician/validate-token',
            {},
            token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.status ?? 'NETWORK_ERROR');
    }
})

const userSlice = createSlice({
    name: 'user',
    initialState: {
        loading: false,
        data: null,
        error: ''
    },
    extraReducers: builder => {
        builder.addCase(fetchUser.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload
            state.error = ''
        })
        builder.addCase(fetchUser.rejected, (state, action) => {
            state.loading = false
            // Keep the last known profile on network errors; a 401 is handled
            // globally (session cleared + emptyUser).
            state.error = String(action.payload ?? action.error.message)
        })
    },
    reducers: {
        emptyUser: (state) => {
            state.loading = false;
            state.data = null;
            state.error = '';
        },
        setUserData: (state, action) => {
            state.loading = false;
            state.data = action.payload;
            state.error = '';
        }
    }
});

export const { emptyUser, setUserData } = userSlice.actions;

export default userSlice.reducer