import { createSlice } from '@reduxjs/toolkit';

const locationSlice = createSlice({
  name: 'location',
  initialState: null,
  reducers: {
    setLocation: (state, action) => action.payload,
    clearLocation: () => null,
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
