import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import { SettingsNotifications } from "src/sections/settings/settings-notifications";
import { SettingsPassword } from "src/sections/settings/settings-password";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { InputStatus } from "src/sections/io/input";
import { useCallback, useState } from "react";
import { OutputStatus } from "src/sections/io/output";

const Page = () => {
  const [inputStatus, setInputStatus] = useState({
    IN01: true,
    IN02: false,
    IN03: true,
  });
  const handleChange = useCallback(
    (event, input) => {
      console.log(event.target.state);
      setInputStatus((prev) => ({ ...prev, [input]: !prev[input] }));
    },
    [inputStatus]
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
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Typography variant="h4">I/O</Typography>
            <InputStatus inputStatus={inputStatus} onChange={handleChange} />
            <OutputStatus inputStatus={inputStatus} onChange={handleChange} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
