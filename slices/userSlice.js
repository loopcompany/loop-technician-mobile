import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '../services/URL';

export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
    return await axios
        .post(`${uri}/technician/validate-token`,{}, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
        .then(response => response?.data)
        .catch(error => { console.log(error) })
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
            state.data = null
            state.error = action.error.message
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