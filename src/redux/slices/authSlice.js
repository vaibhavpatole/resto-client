import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, whoami, logout } from '../../services/apiService';

// LOGIN USER THUNK
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await login(credentials, {
      withCredentials: true,
    });
    // console.log('Login Response:', res);
    return res.data.user;

  } catch (err) {
    // console.log('Login Error:', err);
    return rejectWithValue(err.response?.data?.message || err.response?.data?.error);
  }
});

// WHOAMI THUNK (already present)
export const fetchUser = createAsyncThunk('auth/fetchUser', async () => {
  const res = await whoami();
  return res.data.user;
});

// LOGOUT USER THUNK
export const logoutUser = createAsyncThunk('auth/logout', async (_, { dispatch, rejectWithValue }) => {
  try {
    await logout();
    dispatch(authSlice.actions.logout());
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.response?.data?.error);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    role: null,
    loading: true,
    error: null,
    message: null,
  },

  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
    },
    clearAuthMessages: (state) => {
      state.error = null;
      state.message = null;
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.role = action.payload.role;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.loading = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.role = action.payload.role;
        state.error = null;
        state.message = 'Login successful';
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.error = action.payload;
        state.message = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.error = null;
        state.message = 'Logout successful';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
        state.message = null;
      })
      ;
  },
});

export const { clearAuthMessages } = authSlice.actions;

export default authSlice.reducer;