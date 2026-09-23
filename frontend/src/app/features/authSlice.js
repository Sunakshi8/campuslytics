import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('campuslytics_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: storedUser,
  profile: null,
  token: localStorage.getItem('campuslytics_token') || null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

const persist = (token, user) => {
  if (token) localStorage.setItem('campuslytics_token', token);
  if (user) localStorage.setItem('campuslytics_user', JSON.stringify(user));
};

export const studentSignup = createAsyncThunk('auth/studentSignup', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.studentSignup(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const companySignup = createAsyncThunk('auth/companySignup', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.companySignup(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.login(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.me();
    return res.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.profile = null;
      state.token = null;
      localStorage.removeItem('campuslytics_token');
      localStorage.removeItem('campuslytics_user');
    },
    setProfile(state, action) {
      state.profile = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
    extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        persist(null, action.payload.user);
      })
      .addMatcher(
        (action) => [studentSignup.pending, companySignup.pending, login.pending, fetchMe.pending].some((t) => t.type === action.type),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => [studentSignup.fulfilled, companySignup.fulfilled, login.fulfilled].some((t) => t.type === action.type),
        (state, action) => {
          state.status = 'succeeded';
          state.user = action.payload.user;
          state.profile = action.payload.profile;
          state.token = action.payload.token;
          persist(action.payload.token, action.payload.user);
        }
      )
      .addMatcher(
        (action) =>
          [studentSignup.rejected, companySignup.rejected, login.rejected, fetchMe.rejected].some((t) => t.type === action.type),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { logout, setProfile, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
