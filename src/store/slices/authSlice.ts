import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AuthState {
  isSignedIn: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    photo: string | null;
  } | null;
  accessToken: string | null;
  idToken: string | null;
}

const initialState: AuthState = {
  isSignedIn: false,
  user: null,
  accessToken: null,
  idToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn: (
      state,
      action: PayloadAction<{
        user: AuthState['user'];
        accessToken: string;
        idToken: string;
      }>,
    ) => {
      state.isSignedIn = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.idToken = action.payload.idToken;
    },
    signOut: state => {
      state.isSignedIn = false;
      state.user = null;
      state.accessToken = null;
      state.idToken = null;
    },
    updateTokens: (
      state,
      action: PayloadAction<{accessToken: string; idToken: string}>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.idToken = action.payload.idToken;
    },
  },
});

export const {signIn, signOut, updateTokens} = authSlice.actions;
export default authSlice.reducer;
