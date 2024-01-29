import { Avatar, Box, Card, CardContent, Slider, Stack, Typography } from "@mui/material";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import { SliderWithMetric } from "src/components/slider-with-metric";
import { memo } from "react";

export const OverviewSystemDiagnosis = memo((props) => {
  const { value = {}, sx } = props;
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
            {Object.keys(value).length
              ? Object.entries(value).map(([key, value]) => (
                  <Box key={key}>
                    <Typography gutterBottom>{value.title}</Typography>
                    <SliderWithMetric
                      valueLabelDisplay="auto"
                      value={value.value}
                      min={value.min}
                      max={value.max}
                      metricMin={value.metricMin}
                      metricMax={value.metricMax}
                    />
                  </Box>
                ))
              : null}
          </Stack>
          <Avatar sx={{ backgroundColor: "info.dark", height: 56, width: 56 }}>
            <TroubleshootIcon />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
});
