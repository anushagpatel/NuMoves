import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// Try to get user info from localStorage or cookies
const storedUser = localStorage.getItem("user");
const parsedUser = storedUser ? JSON.parse(storedUser) : null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthorized: !!parsedUser,
    user: parsedUser,
  },
  reducers: {
    setAuth(state, action) {
      const { user } = action.payload;
      state.isAuthorized = true;
      state.user = user;

      // Optional: persist user info in localStorage
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout(state) {
      state.isAuthorized = false;
      state.user = null;

      // Clean up
      localStorage.removeItem("user");
      Cookies.remove("token"); // or your auth cookie key
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
