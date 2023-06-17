import { configureStore } from "@reduxjs/toolkit";
import locationReducer from "./reducers/locationSlice";

const store = configureStore({
  reducer: {
    vroom: locationReducer,
  },
});

export default store;
