import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import Head from "next/head";
import { useSelector } from "react-redux";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { LogViewer } from "src/sections/trial-run/log-viewer";

const MIN_HEIGHT = 550;
const Page = () => {
  const errorLogsSelector = useSelector((state) => state.MQTTClient.error_logs);
  return (
    <>
      <Head>
        <title>Error Logs | VTN2</title>
      </Head>
      <Box component={"main"} sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg" sx={{ overflow: "hidden" }}>
          <Stack spacing={3}>
            <Typography variant="h4">Error Logs</Typography>
            <Paper
              elevation={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: MIN_HEIGHT,
                padding: "20px 30px",
              }}
            >
              <LogViewer logs={errorLogsSelector} maxWidth={500} />
            </Paper>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
