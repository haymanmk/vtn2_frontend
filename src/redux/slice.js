import { createSlice } from "@reduxjs/toolkit";

export const mainSlice = createSlice({
  name: "main",
  initialState: {
    employee_id: "",
  },
  reducers: {
    fetch_employee_id: (state, action) => {
      state.value;
    },
  },
});

export default mainSlice.reducer;
