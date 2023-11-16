import { createSlice } from "@reduxjs/toolkit";

const DEBUG_MESSAGE = false;
const LOGS_MAX_LENGTH = 50;

const MQTTClientSlice = createSlice({
  name: "mqtt_client",
  initialState: {
    client: null,
    state: "disconnected",
    operation_mode: "standby", //
    fifo_tasks: [],
    message: {},
    vacuum_data: [],
    o2_pressure_data: [],
    o2_level_data: [],
    logs: [],
  },
  reducers: {
    subscribeMQTT: (state, action) => {
      state.fifo_tasks.push({
        task: "subscribe",
        payload: action.payload,
      });
    },
    unsubscribeMQTT: (state, action) => {
      if (action.payload in state.message) delete state.message[action.payload];
      state.fifo_tasks.push({
        task: "unsubscribe",
        payload: action.payload,
      });
    },
    publishMQTT: (state, action) => {
      state.fifo_tasks.push({
        task: "publish",
        payload: action.payload,
      });
    },
    updateState: (state, action) => {
      state.state = action.payload;
    },
    updateOperationMode: (state, action) => {
      state.operation_mode = action.payload;
    },
    updateMessage: (state, action) => {
      Object.keys(action.payload).map((key) => {
        state.message[key] = action.payload[key];
      });
    },
    updateSubscribedMQTT: (state, action) => {
      state.subscribed[action.payload] = true;
    },
    updateVacuumData: (state, action) => {
      state.vacuum_data = action.payload;
    },
    updateO2PressureData: (state, action) => {
      state.o2_pressure_data = action.payload;
    },
    updateO2LevelDate: (state, action) => {
      state.o2_level_data = action.payload;
    },
    updateLog: (state, action) => {
      const logs = action.payload;
      if (Array.isArray(logs)) {
        const overflow = state.logs.length + logs.length - LOGS_MAX_LENGTH;
        if (overflow > 0) state.logs.splice(0, overflow);
        state.logs.push(...logs);
      }
      if (typeof logs === "object") {
        if (state.logs.length === LOGS_MAX_LENGTH) state.logs.splice(0, 1);
        state.logs.push(logs);
      }
    },
    clearBuffer: (state, action) => {
      const { key, length } = action.payload;
      if (key in state) state[key].splice(0, length);
    },
    clearAllBuffer: (state) => {
      state.fifo_tasks = [];
    },
  },
});

export const MQTTStoreAction = MQTTClientSlice.actions;

export default MQTTClientSlice.reducer;
