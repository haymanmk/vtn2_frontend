import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "src/redux/slice";

export default configureStore({ reducer: { main: mainReducer } });
