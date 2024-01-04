import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import InputStatus from "src/sections/io/input";
import { useCallback, useEffect, useState } from "react";
import OutputStatus from "src/sections/io/output";
import { useDispatch, useSelector } from "react-redux";
import { MQTTStoreAction } from "src/redux/mqtt-client-slice";
import {
  TOPIC_INPUT_STATUS,
  TOPIC_INPUT_COMMAND,
  TOPIC_OUTPUT_STATUS,
  TOPIC_OUTPUT_COMMAND,
  TOPIC_OPERATION_STATE_STATUS,
  TOPIC_OPERATION_MODE_STATUS,
  TOPIC_OPERATION_MODE_COMMAND,
  TOPIC_OPERATION_STATE_COMMAND,
} from "src/utils/mqtt-topics";

const { subscribeMQTT, unsubscribeMQTT, publishMQTT } = MQTTStoreAction;
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
const READ_ALL_IO_COMMAND = {
  [TOPIC_INPUT_COMMAND]: { cmd: "readAll", msg: null },
  [TOPIC_OUTPUT_COMMAND]: { cmd: "readAll", msg: null },
};

const useInitMQTT = (mqttState, dispatch) => {
  useEffect(() => {
    switch (mqttState) {
      case "connected":
        dispatch(subscribeMQTT(TOPIC_INPUT_STATUS));
        dispatch(subscribeMQTT(TOPIC_OUTPUT_STATUS));
        dispatch(publishMQTT(READ_ALL_IO_COMMAND));
        break;
      case "error":
        break;
      default:
        break;
    }

    return () => {
      dispatch(unsubscribeMQTT(TOPIC_INPUT_STATUS));
      dispatch(unsubscribeMQTT(TOPIC_OUTPUT_STATUS));
    };
  }, [mqttState]);
};

const useIOChanged = (ioStatusChanged, setIOStatus) => {
  useEffect(() => {
    if (typeof ioStatusChanged === "undefined") return;
    const { cmd, msg } = ioStatusChanged;
    if (typeof cmd === "undefined") return;

    switch (cmd) {
      case "readAll":
      case "status":
        Object.entries(msg).map(([key, value]) => {
          setIOStatus((prev) => ({
            ...prev,
            [key]: value,
          }));
        });
        break;
      default:
        break;
    }
  }, [ioStatusChanged]);
};

const useOperationModeManager = (setBlocking, state, mode, dispatch) => {
  useEffect(() => {
    if (mode === "manual") {
      setBlocking(false);
      return;
    }

    if (state !== "running") {
      dispatch(
        publishMQTT({ [TOPIC_OPERATION_MODE_COMMAND]: { cmd: "write", msg: { mode: "manual" } } })
      );
    } else setBlocking(true);
    return () => {};
  }, [setBlocking, state, mode]);
};

const Page = () => {
  const [inputStatus, setInputStatus] = useState({});
  const [outputStatus, setOutputStatus] = useState({});
  // Blocking all the IO control if current operation mode is not allowable.
  const [blocking, setBlocking] = useState(true);

  const mqttState = useSelector((state) => state.MQTTClient.state);
  const inputStatusChanged = useSelector((state) => {
    if (TOPIC_INPUT_STATUS in state.MQTTClient.message)
      return state.MQTTClient.message[TOPIC_INPUT_STATUS];
  });
  const outputStatusChanged = useSelector((state) => {
    if (TOPIC_OUTPUT_STATUS in state.MQTTClient.message)
      return state.MQTTClient.message[TOPIC_OUTPUT_STATUS];
  });
  const operationState = useSelector((state) => state.MQTTClient.operation_state);
  const operationMode = useSelector((state) => state.MQTTClient.operation_mode);

  const dispatch = useDispatch();

  useInitMQTT(mqttState, dispatch);
  useIOChanged(inputStatusChanged, setInputStatus);
  useIOChanged(outputStatusChanged, setOutputStatus);
  useOperationModeManager(setBlocking, operationState, operationMode, dispatch);

  // read current operation status
  useEffect(() => {
    dispatch(publishMQTT({ [TOPIC_OPERATION_STATE_COMMAND]: { cmd: "read" } }));
  }, []);

  const handleInputChange = useCallback(
    (event) => {
      const input = event.target.id;
      setInputStatus((prev) => ({ ...prev, [input]: !prev[input] }));
    },
    [setInputStatus]
  );

  const handleOutputChange = useCallback(
    (id, value) => {
      dispatch(
        publishMQTT({
          [TOPIC_OUTPUT_COMMAND]: {
            cmd: "write",
            msg: {
              id,
              value,
            },
          },
        })
      );
      setOutputStatus((prev) => ({ ...prev, [id]: { ...prev[id], value } }));
    },
    [setOutputStatus]
  );

  return (
    <>
      <Head>
        <title>I/O | VTN2</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Typography variant="h4">I/O</Typography>
            <InputStatus
              inputStatus={inputStatus}
              onChange={handleInputChange}
              disabled={blocking}
            />
            <OutputStatus
              outputStatus={outputStatus}
              onChange={handleOutputChange}
              disabled={blocking}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
