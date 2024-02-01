import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import { SettingsNotifications } from "src/sections/settings/settings-notifications";
import { SettingsPassword } from "src/sections/settings/settings-password";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { TreeViewInput } from "src/components/tree-view-input";
import { useCallback } from "react";

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

const Page = () => {
  const inputChange = useCallback(() => {}, []);
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
            <TreeViewInput configs={mockConfigs} onChange={inputChange} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
