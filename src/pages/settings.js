import Head from "next/head";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Divider,
  IconButton,
  List,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { TreeViewInput } from "src/components/tree-view-input";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const DEBUG = true;

const mockConfigs = [
  {
    "@title": "Parameters",
    "@subtitle": "Process parameters",
    airtight_config: {
      "@label": "Leakage Verification",
      "@comment": "Parameters for Leakage Verification",
      PressureConfig: {
        "@label": "Pressure",
        "@comment": "Coefficient related to pressure monitoring",
        pPressure_high: {
          type: "number",
          label: "pPmax pressure",
          value: 900,
        },
        pPressure_low: {
          type: "number",
          label: "pPmin pressure",
          value: 800,
        },
        pPressure_airtightlow: {
          type: "number",
          label: "pP_airtightlow pressure",
          value: 950,
        },
        pLeakage_stdDiff: {
          type: "number",
          label: "pLeakage_stdDiff",
          value: 3,
        },
      },
      TimeConfig: {
        "@label": "Time Span",
        "@comment": "Time Span Settings",
        pTime_pressureChoke: {
          type: "number",
          label: "pTime_pressureChoke",
          value: 0,
        },
        pTime_pressureTarget: {
          type: "number",
          label: "pTime_pressureTarget",
          value: 15000,
        },
        pTime_pressureMaintain: {
          type: "number",
          label: "pTime_pressureMaintain",
          value: 5000,
        },
        pTime_leakageStable: {
          type: "number",
          label: "pTime_leakageStable",
          value: 5000,
        },
        pTime_leakageTimeout: {
          type: "number",
          label: "pTime_leakageTimeout",
          value: 15000,
        },
      },
    },
    cleanup_config: {
      "@label": "Clean Up",
      "@comment": "Refresh sensor chamber",
      TimeConfig: {
        "@label": "Time Span",
        "@comment": "Time Span Settings",
        pTime_vacuumclose: {
          type: "number",
          label: "pTime_vacuumclose",
          value: 5000,
        },
        pTime_vacuumopen: {
          type: "number",
          label: "pTime_vacuumopen",
          value: 1000,
        },
        pTime_cleantime: {
          type: "number",
          label: "pTime_cleantime",
          value: 25000,
        },
        pTime_readO2content: {
          type: "number",
          label: "pTime_readO2content",
          value: 500,
        },
      },
      O2Config: {
        "@label": "O2 Concentration",
        "@comment": "Stop process if target O2 content is reached",
        pConcentration_cleanup: {
          type: "number",
          label: "pConcentration_cleanup",
          value: 30,
        },
      },
    },
  },
  {
    o2verification_config: {
      O2Config: {
        pConcentration_target: {
          type: "number",
          label: "pConcentration_target",
          value: 30,
        },
      },
    },
  },
  {
    fillN2: {
      CountConfig: {
        pCount_repeater: {
          type: "number",
          label: "pCount_repeater",
          value: 3,
        },
      },
      PressureConfig: {
        pPressure_N2target: {
          type: "number",
          label: "pPressure_N2target",
          value: 1100,
        },
      },
    },
  },
];

const searchFirstKey = (obj) => Object.keys(obj).filter((key) => !key.startsWith("@"))[0];

const TreeViewComponent = memo((props) => {
  const { configs, editable, saveChanged, refreshConfig, ...restProps } = props;
  const [_configs, _setConfigs] = useState(configs);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [collapseAll, setCollapseAll] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [editting, setEditting] = useState(false);
  const disabled = Boolean(!editting);

  if (!_configs) return;

  const updateConfig = (configs, route, value) => {
    if (route.length === 0) return { ...configs, value };
    let _route = [...route];
    const key = _route.shift();
    if (key in configs) return { ...configs, [key]: updateConfig(configs[key], _route, value) };
  };

  const onChange = useCallback(
    (route, value) => {
      if (DEBUG) console.log({ route, value });
      if (route.length === 0) return;
      _setConfigs((prev) => {
        const newConfig = updateConfig(prev, [...route], value);
        console.log("newConfig", newConfig);
        return newConfig;
      });
    },
    [_configs]
  );

  const readTargetKeyValue = (obj, target) => {
    let result = Object.keys(obj).filter((key) => key === target);
    if (result.length) return obj[result[0]];
  };

  const menuButtonClick = useCallback((event) => {
    setExpandAll(false);
    setCollapseAll(false);
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleExpandAll = useCallback(
    (event) => {
      setCollapseAll(false);
      setExpandAll(true);
      setAnchorEl(null);
    },
    [setExpandAll, setAnchorEl]
  );
  const handleCollapseAll = useCallback(
    (event) => {
      setExpandAll(false);
      setCollapseAll(true);
      setAnchorEl(null);
    },
    [setCollapseAll, setAnchorEl]
  );

  const editButtonClick = useCallback((event) => {
    if (editable) setEditting(true);
  }, []);

  const cancelButtonClick = useCallback(
    (event) => {
      refreshConfig(searchFirstKey(_configs));
      setEditting(false);
    },
    [_configs, refreshConfig]
  );

  const saveButtonClick = useCallback(
    (event) => {
      if (DEBUG) console.log("save configs", _configs);
      saveChanged(_configs);
      setEditting(false);
    },
    [_configs]
  );

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "neutral.900" }} aria-label="">
            {(readTargetKeyValue(_configs, "@title") || Object.keys(_configs)[0])[0].toUpperCase()}
          </Avatar>
        }
        action={
          <Box>
            <IconButton onClick={menuButtonClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu id="more_options" anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
              <MenuItem onClick={handleExpandAll}>Expand All</MenuItem>
              <MenuItem onClick={handleCollapseAll}>Collapse All</MenuItem>
            </Menu>
          </Box>
        }
        title={readTargetKeyValue(_configs, "@title") || Object.keys(_configs)[0]}
        subheader={readTargetKeyValue(_configs, "@subtitle")}
      />
      <Divider />
      <CardContent>
        <List>
          <TreeViewInput
            value={_configs}
            onChange={onChange}
            expandAll={expandAll}
            collapseAll={collapseAll}
            disabled={disabled}
            {...restProps}
          />
        </List>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }} disableSpacing>
        {!editting ? (
          <Button disabled={!editable} onClick={editButtonClick}>
            EDIT
          </Button>
        ) : null}
        {editting ? <Button onClick={cancelButtonClick}>CANCEL</Button> : null}
        {editting ? <Button onClick={saveButtonClick}>SAVE</Button> : null}
      </CardActions>
    </Card>
  );
});

const Page = () => {
  const configs = useSelector((state) => mockConfigs);
  const [_configs, setConfigs] = useState([]);
  const [editable, setEditable] = useState(true);

  if (!configs) return;

  useEffect(() => {
    if (!Array.isArray(configs)) setConfigs([configs]);
    else setConfigs([...configs]);
    return () => {
      setConfigs([]);
    };
  }, [configs, setConfigs]);

  const saveChanged = useCallback((newConfigs) => {
    const targetTopic = searchFirstKey(newConfigs);
    if (DEBUG) console.log("Target topic: ", targetTopic);
  }, []);

  const refreshConfig = useCallback((target) => {
    if (DEBUG) console.log(`Refresh target config: ${target}`);
  }, []);

  return (
    <>
      <Head>
        <title>Settings | VTN2</title>
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
            <Typography variant="h4">Settings</Typography>
            {_configs.map((configObj, index) => (
              <TreeViewComponent
                key={index}
                configs={configObj}
                editable={editable}
                saveChanged={saveChanged}
                refreshConfig={refreshConfig}
              />
            ))}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
