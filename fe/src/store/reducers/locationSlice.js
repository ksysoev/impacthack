import { createSlice } from "@reduxjs/toolkit";

const locationSlice = createSlice({
  name: "vroom",
  initialState: {
    location: null,
    zoomMarker: 13,
  },
  reducers: {
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setZoomMarker: (state, action) => {
      state.zoomMarker = action.payload;
    },
    clearLocation: (state) => {
      state.location = null;
      state.zoomMarker = null;
    },
  },
});

export const { setLocation, setZoomMarker, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;