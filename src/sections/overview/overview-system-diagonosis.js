import { Avatar, Card, CardContent, Slider, Stack, Typography } from "@mui/material";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import { SliderWithMetric } from "src/components/slider-with-metric";

export const OverviewSystemDiagnosis = (props) => {
  const { sx } = props;
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack
          alignItems={"flex-start"}
          direction={"row"}
          justifyContent={"space-between"}
          spacing={3}
        >
          <Stack spacing={1}>
            <Typography color={"text.secondary"} variant="overline">
              System Health Diagnosis
            </Typography>
            <Typography gutterBottom>Compressed Air (MPa)</Typography>
            <SliderWithMetric
              valueLabelDisplay="auto"
              value={1}
              min={-0.5}
              max={2}
              metricMin={0.5}
              metricMax={1.5}
            />
          </Stack>
          <Avatar sx={{ backgroundColor: "info.dark", height: 56, width: 56 }}>
            <TroubleshootIcon />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};
