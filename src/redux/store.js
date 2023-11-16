import { configureStore } from "@reduxjs/toolkit";
import mqttClientSlice from "./mqtt-client-slice";

const reducer = {
  MQTTClient: mqttClientSlice,
};

export default configureStore({
  reducer,
});
