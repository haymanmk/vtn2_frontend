import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MQTTStoreAction } from "src/redux/mqtt-client-slice";
import * as mqtt from "mqtt";
import {
  TOPIC_CONTROL_ITEM_STATUS,
  TOPIC_LOG_COMMAND,
  TOPIC_LOG_STATUS,
  TOPIC_OPERATION_STATE_COMMAND,
  TOPIC_OPERATION_STATE_STATUS,
  TOPIC_PARAMETER_STATUS,
  TOPIC_WAVE_STATUS,
  TOPIC_INPUT_STATUS,
  TOPIC_INPUT_COMMAND,
  TOPIC_OUTPUT_STATUS,
  TOPIC_OUTPUT_COMMAND,
  TOPIC_LAST_WILL,
  TOPIC_SYSTEM_INFO_COMMAND,
  TOPIC_SYSTEM_INFO_STATUS,
} from "src/utils/mqtt-topics";

const DEBUG_MESSAGE = false;

const BUFFER_MAX_SIZE = 1000;
const LOGS_MAX_LENGTH = 50;
const LOGS_DAYS = 14;
const PORT = 9001;

// MQTT settings
const serviceName = "Frontend-Agent";
let options = {
  username: "vtn2",
  password: "mis@6699",
  clientId: "",
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  // will: {
  //   topic: "lastWill",
  //   payload: `${serviceName} service abruptly disconnected.`,
  //   qos: 1,
  //   retain: false,
  // },
};
const qos = 1;

/**
 * Parent branch
 * input: manage input states
 * output: manage output states
 * operation_mode: tracking current operation mode
 *
 * Child branch
 * status: read status
 * command: commit actions / control requests
 */

const READ_OPERATION_STATE = {
  [TOPIC_OPERATION_STATE_COMMAND]: { cmd: "read", msg: null },
};

const READ_LOGS = {
  [TOPIC_LOG_COMMAND]: {
    cmd: "read",
    msg: {
      from: new Date() - 24 * 60 * 60 * LOGS_DAYS * 1000,
      until: new Date(),
      limit: LOGS_MAX_LENGTH,
      level: "error",
    },
  },
};

const READ_ALL_INPUTS = {
  [TOPIC_INPUT_COMMAND]: { cmd: "readAll", msg: null },
};

const READ_ALL_OUTPUTS = {
  [TOPIC_OUTPUT_COMMAND]: { cmd: "readAll", msg: null },
};

const READ_SYSTEM_INFO = { [TOPIC_SYSTEM_INFO_COMMAND]: { cmd: "readAll", msg: "sys" } };

const {
  publishMQTT,
  subscribeMQTT,
  unsubscribeMQTT,
  updateState,
  updateOperationMode,
  updateOperationState,
  updateMessage,
  updateVacuumData,
  updateN2PressureData,
  updateO2LevelData,
  updateCleanupPressureData,
  updateLog,
  updateErrorLog,
  updateSystemInfo,
  updateCPUTemperature,
  clearBuffer,
  clearAllBuffer,
} = MQTTStoreAction;

const useInitSubscribePublish = (client, dispatch) => {
  useEffect(() => {
    if (client.current) {
      dispatch(subscribeMQTT(TOPIC_LAST_WILL));
      dispatch(subscribeMQTT(TOPIC_OPERATION_STATE_STATUS));
      dispatch(subscribeMQTT(TOPIC_WAVE_STATUS));
      dispatch(subscribeMQTT(TOPIC_LOG_STATUS));
      dispatch(subscribeMQTT(TOPIC_SYSTEM_INFO_STATUS));
      dispatch(publishMQTT(READ_OPERATION_STATE));
      dispatch(publishMQTT(READ_LOGS));
      dispatch(publishMQTT(READ_SYSTEM_INFO));
    }

    return () => {
      dispatch(unsubscribeMQTT(TOPIC_LAST_WILL));
      dispatch(unsubscribeMQTT(TOPIC_OPERATION_STATE_STATUS));
      dispatch(unsubscribeMQTT(TOPIC_WAVE_STATUS));
      dispatch(unsubscribeMQTT(TOPIC_LOG_STATUS));
      dispatch(unsubscribeMQTT(TOPIC_SYSTEM_INFO_STATUS));
      dispatch(clearAllBuffer());
    };
  }, [client]);
};

const updateCurrentOperationState = (message, dispatch) => {
  try {
    const { cmd, msg } = JSON.parse(message);

    switch (cmd) {
      case "read":
      case "status":
        const { mode, state, error } = msg;
        if (mode) dispatch(updateOperationMode(mode));
        if (state) dispatch(updateOperationState(state));
        break;
    }
  } catch (err) {
    console.error(err);
  }
};

const useProcessTasks = (client, tasks, mqttState, dispatch) => {
  const __lock = useRef();
  useEffect(() => {
    let tasksLen = tasks.length;
    if (__lock.current) return;
    if (mqttState !== "connected") return;
    if (tasksLen <= 0) return;
    const { task, payload } = tasks[0];
    switch (task) {
      case "subscribe":
        __lock.current = true;
        client.current
          .subscribeAsync(payload, { qos })
          .then((granted) => {
            if (DEBUG_MESSAGE) console.log(`MQTT topic "${payload}" subscribed.`);
            dispatch(clearBuffer({ key: "fifo_tasks", length: 1 }));
            __lock.current = false;
          })
          .catch((err) => console.error("MQTT subscribe prone to error: ", err));
        break;
      case "unsubscribe":
        client.current
          .unsubscribeAsync(payload, { qos })
          .then(() => {
            if (DEBUG_MESSAGE) console.log(`MQTT topic "${payload}" unsubscribed.`);
          })
          .catch((err) => console.error("MQTT unsubscribe prone to error: ", err));
        dispatch(clearBuffer({ key: "fifo_tasks", length: 1 }));
        break;
      case "publish":
        Object.entries(payload).forEach(([topic, msg]) => {
          client.current
            .publishAsync(topic, JSON.stringify(msg), { qos })
            .then((granted) => {
              if (DEBUG_MESSAGE) console.log("MQTT succeeds in publishing to topic: ", topic);
            })
            .catch((err) =>
              console.error(`MQTT publish to topic "${topic}" prone to error: ${err}`)
            );
        });
        dispatch(clearBuffer({ key: "fifo_tasks", length: 1 }));
        break;
    }
  }, [client, tasks, mqttState, dispatch]);
};

/**
 * Exported Component
 * @returns {Component}
 */
export const MQTTCenter = () => {
  let vacuumData = [];
  let n2PressureData = [];
  let o2ContentData = [];
  let cleanupPressure = [];
  const dispatch = useDispatch();
  let client = useRef(); //MQTT client
  let webSocketConnectTimeout = useRef();

  // lock state to avoid race condition during sub/pub/unsub MQTT topics

  // Redux Selectors
  const mqttStateSelector = useSelector((state) => state.MQTTClient.state);
  const fifoTaskSelector = useSelector((state) => state.MQTTClient.fifo_tasks);

  useEffect(() => {
    if (!client.current) {
      // const hostname = "172.29.11.49"; 
      const hostname = window.location.hostname;
      options.clientId = `${serviceName}-${Math.random().toString(16).substring(2, 8)}`;
      const _url = `ws://${hostname}:${PORT}`;
      // watch WebSocket Connection timeout
      webSocketConnectTimeout.current = setTimeout(() => {
        const err = `Connect to ${_url} timeout.`;
        console.error(err);
        dispatch(
          updateErrorLog({
            cmd: "error",
            msg: { timestamp: new Date().toLocaleString(), message: err },
            open_snackbar: true,
          })
        );
      }, 10000);
      client.current = mqtt.connect(_url, options);
      dispatch(updateState("connecting"));
    }
    if (client.current) {
      initEventHandler(client.current);
    }

    return (_) => {
      if (client.current) {
        client.current.end();
        client.current = null;
      }
      console.log("Cleanup MQTT");
      dispatch(updateState("disconnected"));
      if (webSocketConnectTimeout.current) clearTimeout(webSocketConnectTimeout.current);

      // release memory
      vacuumData = null;
      n2PressureData = null;
      o2ContentData = null;
    };
  }, [client.current, webSocketConnectTimeout.current]);

  useProcessTasks(client, fifoTaskSelector, mqttStateSelector, dispatch);
  useInitSubscribePublish(client, dispatch);

  const initEventHandler = (client) => {
    if (client) {
      client.on("connect", connectHandler);
      client.on("error", errorHandler);
      client.on("message", messageHandler);
    }
  };

  const connectHandler = (_) => {
    clearTimeout(webSocketConnectTimeout.current);
    console.log("MQTT connected.");
    dispatch(updateState("connected"));
  };

  const errorHandler = (err) => {
    console.error("MQTT error occurred: ", err);
    dispatch(
      updateErrorLog({
        cmd: "error",
        msg: { timestamp: new Date().toLocaleString(), message: err },
        open_snackbar: true,
      })
    );
    dispatch(updateState("error"));
  };

  const messageHandler = (topic, message) => {
    if (DEBUG_MESSAGE) console.log(`MQTT message received from "${topic}": ${message}`);
    handleSpecificTopic(topic, message);
    try {
      dispatch(updateMessage({ [topic]: JSON.parse(message) }));
    } catch (err) {
      dispatch(updateMessage({ [topic]: message.toString() }));
    }
  };

  const handleSpecificTopic = (topic, message) => {
    let cmd, msg;
    try {
      const parsedMsg = JSON.parse(message);
      if ("cmd" in parsedMsg) cmd = parsedMsg.cmd;
      if ("msg" in parsedMsg) msg = parsedMsg.msg;
    } catch (err) {
      console.warn(`Message cannot be parsed into JSON.`);
      msg = message.toString();
    }
    switch (topic) {
      case TOPIC_LAST_WILL:
        const log = {
          cmd: "error",
          msg: { timestamp: new Date().toLocaleString(), message: `Last Will: ${msg}` },
          open_snackbar: true,
        };
        dispatch(updateLog(log));
        dispatch(updateErrorLog(log));
        break;
      case TOPIC_OPERATION_STATE_STATUS:
        updateCurrentOperationState(message, dispatch);
        break;
      case TOPIC_WAVE_STATUS:
        if (cmd === "clear") clearWaveformData();

        if (!msg) return;
        if (cmd === "vacuum_pressure") {
          vacuumData = appendData(msg, vacuumData, BUFFER_MAX_SIZE);
          dispatch(updateVacuumData(vacuumData));
        } else if (cmd === "n2_pressure") {
          n2PressureData = appendData(msg, n2PressureData, BUFFER_MAX_SIZE);
          dispatch(updateN2PressureData(n2PressureData));
        } else if (cmd === "o2_content") {
          o2ContentData = appendData(msg, o2ContentData, BUFFER_MAX_SIZE);
          dispatch(updateO2LevelData(o2ContentData));
        } else if (cmd === "cleanup_pressure") {
          cleanupPressure = appendData(msg, cleanupPressure, BUFFER_MAX_SIZE);
          dispatch(updateCleanupPressureData(cleanupPressure));
        }
        break;
      case TOPIC_LOG_STATUS:
        if (!msg) return;
        try {
          let payload;
          if (typeof msg === "object") payload = msg;
          else payload = JSON.parse(msg);
          if (cmd !== "read") dispatch(updateLog({ cmd, msg: payload }));
          if (cmd === "error") dispatch(updateErrorLog({ cmd, msg: payload, open_snackbar: true }));
          if (cmd === "read") if (payload.length) dispatch(updateErrorLog(payload));
        } catch (err) {
          console.error(err);
        }
        break;
      case TOPIC_SYSTEM_INFO_STATUS:
        if (!msg) return;
        if (cmd === "readAll") {
          try {
            let payload;
            if (typeof msg === "object") payload = msg;
            else payload = JSON.parse(msg);
            dispatch(updateSystemInfo(payload));
          } catch (err) {
            console.error(err);
          }
        } else if (cmd === "temp") {
          dispatch(updateCPUTemperature(msg));
        }
        break;
      default:
        break;
    }
  };

  const clearWaveformData = () => {
    vacuumData = [];
    dispatch(updateVacuumData(vacuumData));
    n2PressureData = [];
    dispatch(updateN2PressureData(n2PressureData));
    o2ContentData = [];
    dispatch(updateO2LevelData(o2ContentData));
    cleanupPressure = [];
    dispatch(updateCleanupPressureData(cleanupPressure));
  };

  return <></>;
};

const appendData = (data, buf, maxSize) => {
  if (!data) return buf;
  if (data.length === 0) return buf;
  if (!buf) buf = [];

  if (buf.length + data.length < maxSize) buf = [...buf, ...data];
  else {
    buf = buf.slice(data.length);
    buf = [...buf, ...data];
  }

  return buf;
};
