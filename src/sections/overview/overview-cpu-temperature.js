import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";

export const OverviewCPUTemperature = (props) => {
  const { value, sx } = props;

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
              CPU °C
            </Typography>
            <Typography variant="h4">{Number(value).toFixed(1)}°C</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: "error.main", height: 56, width: 56 }}>
            <DeviceThermostatIcon />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};
