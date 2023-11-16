import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LinePlotter } from "src/components/line-plotter";
import { MQTTStoreAction } from "src/redux/mqtt-client-slice";
import { TOPIC_WAVE_COMMAND } from "src/utils/mqtt-topics";

const steps = [
  { label: "Extraction", component: "", failed: true, caption: "Failed" },
  { label: "Retain Pressure", component: "", failed: false, caption: "" },
  { label: "Examine Leakage", component: "", failed: false, caption: "" },
  { label: "Fill N2", component: "", failed: false, caption: "" },
  { label: "Extract N2", component: "", failed: false, caption: "" },
  { label: "Read O2 Level", component: "", failed: false, caption: "" },
  { label: "Upload Results", component: "", failed: false, caption: "" },
];

const { publishMQTT } = MQTTStoreAction;

const START_GENERATE_WAVE = {
  [TOPIC_WAVE_COMMAND]: { cmd: "sin_wave", msg: null },
};

const STOP_GENERATE_WAVE = {
  [TOPIC_WAVE_COMMAND]: { cmd: "stop", msg: null },
};

export const StepPage3 = (props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [waveGenerateStarted, setWaveGenerateStarted] = useState(false);

  const dispatch = useDispatch();
  const vacuumData = useSelector((state) => state.MQTTClient.vacuum_data);

  useEffect(() => {
    if (!waveGenerateStarted) {
      dispatch(publishMQTT(START_GENERATE_WAVE));
      setWaveGenerateStarted(true);
      console.log("generate wave");
    }

    return () => {
      dispatch(publishMQTT(STOP_GENERATE_WAVE));
      setWaveGenerateStarted(false);
      console.log("Stop generating wave.");
    };
  }, [setWaveGenerateStarted]);

  const handleBackClicked = useCallback(
    (event) => {
      alert("You are going to STOP the test. Are you sure to STOP the test?");
      props.handleBack();
    },
    [props]
  );

  const brushed = useCallback((d) => {
    console.log(d);
  }, []);

  return (
    <Card>
      <Box sx={{ px: 2, py: 1 }}>
        <Stack direction="row" justifyContent="space-between">
          <Button onClick={handleBackClicked}>Back</Button>
          <Button hidden disabled></Button>
        </Stack>
      </Box>
      <Divider />
      <CardContent>
        <Grid container spacing={3} justifyContent="space-around">
          <Grid item>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => {
                const Component = step.component;
                return (
                  <Step key={step.label}>
                    <StepLabel
                      error={step.failed}
                      optional={
                        <Typography variant="caption" color="error">
                          {step.caption}
                        </Typography>
                      }
                    >
                      {step.label}
                    </StepLabel>
                    <StepContent>{Component && <Component />}</StepContent>
                  </Step>
                );
              })}
            </Stepper>
          </Grid>
          <Grid item>
            <Box>
              <LinePlotter width={400} height={350} data={vacuumData} brushed={brushed} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
