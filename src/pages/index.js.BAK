import { Box, Container, Divider, Stack, Step, StepLabel, Stepper } from "@mui/material";
import Head from "next/head";
import { useCallback, useState } from "react";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { StepPage1 } from "src/sections/dashboard/step_page_1";
import { StepPage2 } from "src/sections/dashboard/step_page_2";
import { StepPage3 } from "src/sections/dashboard/step_page_3";

const steps = ["Enter Production Order", "Enter ESN", "Process Start"];
const pages = [StepPage1, StepPage2, StepPage3];

const SelectSubPage = (props) => {
  const SubPage = pages[props.index];
  if (!SubPage) return <div>Invalid index</div>;
  return <SubPage {...props} />;
};

const Page = () => {
  const [activeStep, setActiveStep] = useState(2);

  const handleNext = useCallback(() => {
    setActiveStep((prev) => prev + 1);
  }, [activeStep]);
  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, [activeStep]);

  return (
    <>
      <Head>
        <title>Dashboard | VTN2</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          <Stack spacing={3} direction="column">
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                return (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
            <Divider />
            <SelectSubPage index={activeStep} handleNext={handleNext} handleBack={handleBack} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
