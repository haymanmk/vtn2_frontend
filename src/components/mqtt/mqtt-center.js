import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MQTTStoreAction } from "src/redux/mqtt-client-slice";
import * as mqtt from "mqtt";
import {
  TOPIC_CONTROL_ITEM_STATUS,
  TOPIC_LOG_COMMAND,
  TOPIC_LOG_STATUS,
  TOPIC_OPERATION_MODE_COMMAND,
  TOPIC_OPERATION_MODE_STATUS,
  TOPIC_PARAMETER_STATUS,
  TOPIC_WAVE_DATA,
  TOPIC_INPUT_STATUS,
  TOPIC_INPUT_COMMAND,
  TOPIC_OUTPUT_STATUS,
  TOPIC_OUTPUT_COMMAND,
} from "src/utils/mqtt-topics";

const DEBUG_MESSAGE = false;

const BUFFER_MAX_SIZE = 1000;
const UPDATE_BATCH = 5;
const HOSTNAME = "172.29.8.47"; // location.hostname;
const PORT = 9001;

let segmentLength = 0;

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
  will: {
    topic: "lastWill",
    payload: `${serviceName} service abruptly disconnected.`,
    qos: 1,
    retain: false,
  },
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

const READ_OPERATION_MODE = {
  [TOPIC_OPERATION_MODE_COMMAND]: { cmd: "read_operation_mode", msg: null },
};

const READ_LOGS = {
  [TOPIC_LOG_COMMAND]: { cmd: "readAll", msg: null },
};

const READ_ALL_INPUTS = {
  [TOPIC_INPUT_COMMAND]: { cmd: "readAll", msg: null },
};

const READ_ALL_OUTPUTS = {
  [TOPIC_OUTPUT_COMMAND]: { cmd: "readAll", msg: null },
};

const {
  publishMQTT,
  subscribeMQTT,
  unsubscribeMQTT,
  updateState,
  updateOperationMode,
  updateMessage,
  updateVacuumData,
  updateO2PressureData,
  updateO2LevelDate,
  updateLog,
  clearBuffer,
  clearAllBuffer,
} = MQTTStoreAction;

const useInitSubscribePublish = (client, dispatch) => {
  useEffect(() => {
    if (client.current) {
      dispatch(subscribeMQTT(TOPIC_OPERATION_MODE_STATUS));
      dispatch(subscribeMQTT(TOPIC_WAVE_DATA));
      dispatch(subscribeMQTT(TOPIC_LOG_STATUS));
      dispatch(publishMQTT(READ_OPERATION_MODE));
      dispatch(publishMQTT(READ_LOGS));
    }

    return () => {
      dispatch(unsubscribeMQTT(TOPIC_OPERATION_MODE_STATUS));
      dispatch(unsubscribeMQTT(TOPIC_WAVE_DATA));
      dispatch(unsubscribeMQTT(TOPIC_LOG_STATUS));
      dispatch(clearAllBuffer());
    };
  }, [client]);
};

const updateCurrentOperationMode = (msg, dispatch) => {
  if (msg.cmd === "reply_operation_mode") dispatch(updateOperationMode(msg.msg));
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
  let o2PressureData = [];
  let o2LevelData = [];
  const dispatch = useDispatch();
  let client = useRef(); //MQTT client

  // lock state to avoid race condition during sub/pub/unsub MQTT topics

  // Redux Selectors
  const mqttStateSelector = useSelector((state) => state.MQTTClient.state);
  const fifoTaskSelector = useSelector((state) => state.MQTTClient.fifo_tasks);

  useEffect(() => {
    if (!client.current) {
      options.clientId = `${serviceName}-${Math.random().toString(16).substring(2, 8)}`;
      const _url = `ws://${HOSTNAME}:${PORT}`;
      client.current = mqtt.connect(_url, options);
      dispatch(updateState("connecting"));
    }
    if (client.current) initEventHandler(client.current);

    return (_) => {
      if (client.current) {
        client.current.end();
        client.current = null;
      }
      console.log("Cleanup MQTT");
      dispatch(updateState("disconnected"));

      // release memory
      vacuumData = null;
      o2LevelData = null;
      o2PressureData = null;
    };
  }, [client]);

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
    console.log("MQTT connected.");
    dispatch(updateState("connected"));
  };

  const errorHandler = (err) => {
    console.error("MQTT error occurred: ", err);
    dispatch(updateState("error"));
  };

  const messageHandler = (topic, message) => {
    if (DEBUG_MESSAGE) console.log(`MQTT message received from "${topic}": ${message}`);
    handleSpecificTopic(topic, message);
    dispatch(updateMessage({ [topic]: JSON.parse(message) }));
  };

  const handleSpecificTopic = (topic, message) => {
    const { cmd, msg } = JSON.parse(message);
    switch (topic) {
      case TOPIC_OPERATION_MODE_STATUS:
        updateCurrentOperationMode(message, dispatch);
        break;
      case TOPIC_WAVE_DATA:
        if (!msg) return;
        segmentLength += msg.length;
        vacuumData = appendData(msg, vacuumData, BUFFER_MAX_SIZE);
        if (segmentLength >= UPDATE_BATCH) {
          dispatch(updateVacuumData(vacuumData));
          segmentLength = 0;
        }
        break;
      case TOPIC_LOG_STATUS:
        if (!msg) return;
        dispatch(updateLog(msg));
        break;
      default:
        break;
    }
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
