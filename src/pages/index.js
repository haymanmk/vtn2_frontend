import Head from "next/head";
import { Box, Container, Unstable_Grid2 as Grid } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { OverviewCPUTemperature } from "src/sections/overview/overview-cpu-temperature";
import { OverviewSystemInfo } from "src/sections/overview/overview-system-info";
import { OverviewCPUInfo } from "src/sections/overview/overview-cpu-info";
import { useDispatch, useSelector } from "react-redux";
import { OverviewSystemDiagnosis } from "src/sections/overview/overview-system-diagonosis";
import { useEffect } from "react";
import { MQTTStoreAction } from "src/redux/mqtt-client-slice";
import {
  TOPIC_SYSTEM_DIAGNOSIS_COMMAND,
  TOPIC_SYSTEM_DIAGNOSIS_STATUS,
} from "src/utils/mqtt-topics";

const Page = () => {
  const dispatch = useDispatch();
  const { subscribeMQTT, publishMQTT, unsubscribeMQTT } = MQTTStoreAction;
  const systemInfoSelector = useSelector((state) => state.MQTTClient.system_info);
  const cpuTemperatureSelector = useSelector((state) => state.MQTTClient.cpu_temperature);
  const systemDiagnosisSelector = useSelector((state) => {
    if (TOPIC_SYSTEM_DIAGNOSIS_STATUS in state.MQTTClient.message)
      if ("msg" in state.MQTTClient.message[TOPIC_SYSTEM_DIAGNOSIS_STATUS])
        return state.MQTTClient.message[TOPIC_SYSTEM_DIAGNOSIS_STATUS]["msg"];
  });

  useEffect(() => {
    // subscribe
    dispatch(subscribeMQTT(TOPIC_SYSTEM_DIAGNOSIS_STATUS));

    // publish
    dispatch(publishMQTT({ [TOPIC_SYSTEM_DIAGNOSIS_COMMAND]: { cmd: "readAll", msh: null } }));
    return () => {
      dispatch(unsubscribeMQTT(TOPIC_SYSTEM_DIAGNOSIS_STATUS));
    };
  }, []);

  return (
    <>
      <Head>
        <title>Overview | VTN2</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} lg={4}>
              <OverviewCPUTemperature value={cpuTemperatureSelector} sx={{ height: 1 }} />
            </Grid>
            <Grid xs={12} sm={6} lg={4}>
              <OverviewCPUInfo value={systemInfoSelector} sx={{ height: 1 }} />
            </Grid>
            <Grid xs={12} sm={6} lg={4}>
              <OverviewSystemInfo value={systemInfoSelector} sx={{ height: 1 }} />
            </Grid>
            <Grid xs={36} sm={18} lg={12}>
              <OverviewSystemDiagnosis value={systemDiagnosisSelector} sx={{ height: 1 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
