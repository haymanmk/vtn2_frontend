import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  TOPIC_OPERATION_MODE_COMMAND,
  TOPIC_OPERATION_STATE_COMMAND,
  TOPIC_OPERATION_STATE_STATUS,
  TOPIC_PARAMETER_COMMAND,
  TOPIC_PARAMETER_STATUS,
} from "src/utils/mqtt-topics";
import { updateNestedConfig } from "src/utils/utils";

const XS = 3;
const MIN_HEIGHT = 550;
const MAX_HEIGHT = 650;
const DEBUG_MESSAGE = false;

const { subscribeMQTT, publishMQTT, unsubscribeMQTT } = MQTTStoreAction;

const READ_RECIPE_LIST = { [TOPIC_PARAMETER_COMMAND]: { cmd: "list", msg: null } };

function debugMessage() {
  if (DEBUG_MESSAGE) console.log(...arguments);
}

const useHookParameterChange = (
  dispatch,
  mqttState,
  setSelectedProgram,
  selectedProgram,
  setRecipeList,
  setParameters
) => {
  useEffect(() => {
    if (mqttState !== "connected") return;
    dispatch(subscribeMQTT(TOPIC_PARAMETER_STATUS));
    dispatch(publishMQTT(READ_RECIPE_LIST));

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
        setParameters(msg);
        break;
    }
  }, [parameterStatusSelector, setSelectedProgram, selectedProgram]);

  useEffect(() => {
    if (selectedProgram)
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
  const [startAllowed, setStartAllowed] = useState(false); // allow to start trial run mode
  const [controls, setControls] = useState({});
  const [editing, setEditing] = useState(false);

  const dispatch = useDispatch();
  const mqttState = useSelector((state) => state.MQTTClient.state);
  const operationMode = useSelector((state) => state.MQTTClient.operation_mode);
  const operationState = useSelector((state) => state.MQTTClient.operation_state);

  /**
   * Data for graph plotting
   */
  const vacuumLineData = useSelector((state) => state.MQTTClient.vacuum_data);
  const n2PressureData = useSelector((state) => state.MQTTClient.n2_pressure_data);
  const o2ContentData = useSelector((state) => state.MQTTClient.o2_level_data);
  const cleanupPressureData = useSelector((state) => state.MQTTClient.cleanup_pressure_data);
  const linesData = useMemo(() => {
    let arr = [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]];
    if (cleanupPressureData.length) arr[0] = cleanupPressureData;
    if (vacuumLineData.length) arr[1] = vacuumLineData;
    if (n2PressureData.length) arr[2] = n2PressureData;
    if (o2ContentData.length) arr[3] = o2ContentData;
    return arr;
  }, [vacuumLineData, n2PressureData, o2ContentData, cleanupPressureData]);

  const startTrialRun = useCallback(
    (event) => {
      if (selectedProgram)
        dispatch(
          publishMQTT({
            [TOPIC_OPERATION_MODE_COMMAND]: {
              cmd: "write",
              msg: { mode: "trial-run", recipe_id: selectedProgram },
            },
          })
        );
    },
    [selectedProgram]
  );

  const stopTrialRun = useCallback((event) => {
    dispatch(
      publishMQTT({ [TOPIC_OPERATION_MODE_COMMAND]: { cmd: "write", msg: { mode: "emg-stop" } } })
    );
  }, []);

  // Read current operation state of backend control center.
  useEffect(() => {
    dispatch(publishMQTT({ [TOPIC_OPERATION_STATE_COMMAND]: { cmd: "read" } }));
  }, []);

  useEffect(() => {
    if (operationState !== "running") {
      setStartAllowed(true);
    } else {
      setStartAllowed(false);
    }
  }, [setStartAllowed, operationState]);

  useHookParameterChange(
    dispatch,
    mqttState,
    setSelectedProgram,
    selectedProgram,
    setRecipeList,
    setParameters
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
    (route, value) => {
      debugMessage(`onChangeParameter: ${route} - ${value}`);
      setParameters((prev) => {
        const newConfig = updateNestedConfig(prev, route, value);
        debugMessage("newConfig: ", newConfig);
        return newConfig;
      });
    },
    [setParameters]
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

  const onClick_Edit = useCallback(
    (event) => {
      if (Object.keys(parameters).length !== 0) setTimeout(() => setEditing(true), 200);
    },
    [setEditing, parameters]
  );

  const onClick_Save = useCallback(
    (event) => {
      submitParameterChanges(event);
      setTimeout(() => setEditing(false), 200);
    },
    [submitParameterChanges, setEditing]
  );

  const onClick_Cancel = useCallback(
    (event) => {
      dispatch(publishMQTT({ [TOPIC_PARAMETER_COMMAND]: { cmd: "read", msg: selectedProgram } }));
      setTimeout(() => {
        setEditing(false);
      }, 200);
    },
    [setEditing, selectedProgram]
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
                maxHeight: MAX_HEIGHT,
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
                    xs={XS}
                    disabled={!editing}
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
                    data={linesData}
                    options={{
                      y_label_pos: "side",
                      x_label: "sec",
                      y_labels: ["Cleanup(mbar)", "Vacuum(mbar)", "N2(mbar)", "O2(%)"],
                    }}
                  />
                </ContentSelector>
              </Box>
              <Divider />
              <Box component={"div"} sx={{ display: "flex", justifyContent: "flex-end" }}>
                {editing && selectedTab === 0 && (
                  <Button size="small" onClick={onClick_Save}>
                    SAVE
                  </Button>
                )}
                {editing && selectedTab === 0 && (
                  <Button size="small" onClick={onClick_Cancel}>
                    CANCEL
                  </Button>
                )}
                {!editing && selectedTab === 0 && (
                  <Button size="small" onClick={onClick_Edit} disabled={!startAllowed}>
                    EDIT
                  </Button>
                )}
                <Button size="small" disabled={!startAllowed || editing} onClick={startTrialRun}>
                  Start
                </Button>
                <Button size="small" onClick={stopTrialRun} disabled={editing}>
                  Stop
                </Button>
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
