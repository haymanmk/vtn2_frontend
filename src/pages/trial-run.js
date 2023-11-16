import { Box, Container, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { flexbox } from "@mui/system";
import { index } from "d3";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { MQTTStoreAction } from "src/redux/mqtt-client-slice";
import { Control } from "src/sections/trial-run/control";
import { GraphPlotter } from "src/sections/trial-run/graph-plotter";
import { LogViewer } from "src/sections/trial-run/log-viewer";
import { Parameters } from "src/sections/trial-run/parameter";
import {
  TOPIC_CONTROL_ITEM_COMMAND,
  TOPIC_CONTROL_ITEM_STATUS,
  TOPIC_PARAMETER_COMMAND,
  TOPIC_PARAMETER_STATUS,
} from "src/utils/mqtt-topics";

const XS = 3;
const MIN_HEIGHT = 500;

const { subscribeMQTT, publishMQTT, unsubscribeMQTT } = MQTTStoreAction;

const mockLines = [
  [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 3],
    [4, 3.5],
  ],
  [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
  ],
  [
    [2, 3],
    [3.3, 4.5],
    [5, 2],
    [7, 9],
  ],
  [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 3],
    [4, 5],
  ],
  [[0, 1]],
];
const useHookParameterChange = (
  dispatch,
  mqttState,
  setSelectedProgram,
  selectedProgram,
  setRecipeList,
  setParameters,
  parameterBackup
) => {
  useEffect(() => {
    if (mqttState !== "connected") return;
    dispatch(subscribeMQTT(TOPIC_PARAMETER_STATUS));
    dispatch(publishMQTT({ [TOPIC_PARAMETER_COMMAND]: { cmd: "list", msg: null } }));

    return () => {
      dispatch(unsubscribeMQTT(TOPIC_PARAMETER_STATUS));
    };
  }, [mqttState]);

  const parameterStatusSelector = useSelector(
    (state) =>
      TOPIC_PARAMETER_STATUS in state.MQTTClient.message &&
      state.MQTTClient.message[TOPIC_PARAMETER_STATUS]
  );

  useEffect(() => {
    const { cmd, msg } = parameterStatusSelector;
    switch (cmd) {
      case "list":
        setRecipeList(msg);
        if (selectedProgram === "") setSelectedProgram(msg[0]);
        break;
      case "read":
        parameterBackup.current = msg;
        setParameters(msg);
        break;
    }
  }, [parameterStatusSelector, setSelectedProgram, selectedProgram]);

  useEffect(() => {
    dispatch(publishMQTT({ [TOPIC_PARAMETER_COMMAND]: { cmd: "read", msg: selectedProgram } }));
  }, [selectedProgram]);
};

const useHookControlItemChange = (dispatch, mqttState, setControls) => {
  useEffect(() => {
    if (mqttState !== "connected") return;
    dispatch(subscribeMQTT(TOPIC_CONTROL_ITEM_STATUS));
    dispatch(publishMQTT({ [TOPIC_CONTROL_ITEM_COMMAND]: { cmd: "readAll", msg: null } }));

    return () => {
      dispatch(unsubscribeMQTT(TOPIC_CONTROL_ITEM_STATUS));
    };
  }, [mqttState]);

  const controlItemStatusSelector = useSelector(
    (state) =>
      TOPIC_CONTROL_ITEM_STATUS in state.MQTTClient.message &&
      state.MQTTClient.message[TOPIC_CONTROL_ITEM_STATUS]
  );

  useEffect(() => {
    const { cmd, msg } = controlItemStatusSelector;
    switch (cmd) {
      case "readAll":
        setControls(msg);
        break;
      case "write":
        break;
      case "update":
        const { id, value } = msg;
        setControls((prev) => ({
          ...prev,
          [id]: value,
        }));
        break;
    }
  }, [controlItemStatusSelector, setControls]);
};

/**
 * Page Component
 * @returns {Component}
 */
const Page = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [parameters, setParameters] = useState({});
  const [recipeList, setRecipeList] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [controls, setControls] = useState({});
  // const [lineData, setLineData] = useState(mockLine(10000));
  const parameterBackup = useRef(); // parameter backup for recovering the edited parameters

  const dispatch = useDispatch();
  const mqttState = useSelector((state) => state.MQTTClient.state);
  const vacuumLineData = useSelector((state) => state.MQTTClient.vacuum_data);

  // Request parameters from backend service

  useHookParameterChange(
    dispatch,
    mqttState,
    setSelectedProgram,
    selectedProgram,
    setRecipeList,
    setParameters,
    parameterBackup
  );

  useHookControlItemChange(dispatch, mqttState, setControls);

  const logs = useSelector((state) => state.MQTTClient.logs);

  const handleTabChange = useCallback(
    (event, newValue) => {
      setSelectedTab(newValue);
    },
    [setSelectedTab]
  );

  const handleRecipeSelect = useCallback(
    (event) => {
      setSelectedProgram(event.target.value);
    },
    [setSelectedProgram]
  );
  const onChangeParameter = useCallback(
    (id, value) => {
      setParameters((prev) => ({ ...prev, [id]: { ...prev[id], value: value } }));
    },
    [setParameters]
  );
  const recoverParameters = useCallback(
    (event) => {
      setParameters((prev) => ({ ...prev, ...parameterBackup.current }));
    },
    [parameterBackup, setParameters]
  );
  const submitParameterChanges = useCallback(
    (event) => {
      dispatch(
        publishMQTT({
          [TOPIC_PARAMETER_COMMAND]: {
            cmd: "write",
            msg: { progNum: selectedProgram, parameters },
          },
        })
      );
    },
    [selectedProgram, parameters]
  );

  const onChangeButton = useCallback(
    (id, value) => {
      dispatch(
        publishMQTT({
          [TOPIC_CONTROL_ITEM_COMMAND]: {
            cmd: "write",
            msg: {
              id: id,
              value: value,
            },
          },
        })
      );
      setControls((prev) => ({
        ...prev,
        [id]: { ...prev[id], value },
      }));
    },
    [setControls]
  );

  return (
    <>
      <Head>
        <title>Trial Run | VTN2</title>
      </Head>
      <Box component={"main"} sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg" sx={{ overflow: "hidden" }}>
          <Stack spacing={3}>
            <Typography variant="h4">Trial Run</Typography>
            <Paper
              elevation={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: MIN_HEIGHT,
                padding: "20px 30px",
              }}
            >
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  marginBottom: "30px",
                  padding: "0px 10px",
                }}
              >
                <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic-tabs">
                  <Tab label="Parameter" />
                  <Tab label="Control" />
                  <Tab label="Log" />
                  <Tab label="Graph" />
                </Tabs>
              </Box>
              <Box component={"div"} sx={{ display: "flex", flexGrow: 2, overflow: "auto" }}>
                <ContentSelector value={selectedTab} index={0}>
                  <Parameters
                    parameters={parameters}
                    selectedProgram={selectedProgram}
                    recipeOptions={recipeList}
                    handleRecipeSelect={handleRecipeSelect}
                    onChange={onChangeParameter}
                    recoverParameters={recoverParameters}
                    onSubmit={submitParameterChanges}
                    xs={XS}
                  />
                </ContentSelector>
                <ContentSelector value={selectedTab} index={1}>
                  <Control controls={controls} onChange={onChangeButton} xs={XS} />
                </ContentSelector>
                <ContentSelector value={selectedTab} index={2}>
                  <LogViewer logs={logs} maxWidth={500} />
                </ContentSelector>
                <ContentSelector value={selectedTab} index={3}>
                  <GraphPlotter
                    data={mockLines}
                    options={{
                      y_label_pos: "side",
                      x_label: "sec",
                      y_labels: ["Vacuum(mbar)", "N2(mbar)", "O2(%)", "Dummy"],
                    }}
                  />
                </ContentSelector>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

const ContentSelector = (props) => props.value === props.index && <>{props.children}</>;

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
