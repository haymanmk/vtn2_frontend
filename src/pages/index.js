import Head from "next/head";
import { subDays, subHours } from "date-fns";
import { Box, Container, Unstable_Grid2 as Grid } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { OverviewCPUTemperature } from "src/sections/overview/overview-cpu-temperature";
import { OverviewSystemInfo } from "src/sections/overview/overview-system-info";
import { OverviewCPUInfo } from "src/sections/overview/overview-cpu-info";
import { useSelector } from "react-redux";
import { OverviewSystemDiagnosis } from "src/sections/overview/overview-system-diagonosis";

const now = new Date();
const mockSystemInfo = {
  cpu: {
    manufacturer: "Sony UK",
    brand: "BCM2711",
    vendor: "ARM",
    family: "Cortex-A72",
  },
  cpuTemperature: { main: 49.66 },
  osInfo: {
    platform: "linux",
    distro: "Raspbian GNU/Linux",
    release: "12",
    codename: "bookworm",
    kernel: "6.1.0-rpi4-rpi-v8",
    arch: "arm",
  },
  system: {
    manufacturer: "Raspberry Pi Foundation",
    model: "Raspberry Pi 4 Model B Rev 1.4",
    version: "d03114",
    raspberry: {
      manufacturer: "Sony UK",
      processor: "BCM2711",
      type: "4B",
      revision: "1.4",
    },
  },
};

const Page = () => {
  const systemInfoSelector = useSelector((state) => state.MQTTClient.system_info);
  const cpuTemperatureSelector = useSelector((state) => state.MQTTClient.cpu_temperature);

  return (
    <>
      <Head>
        <title>Overview | Devias Kit</title>
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
              <OverviewSystemDiagnosis sx={{ height: 1 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
