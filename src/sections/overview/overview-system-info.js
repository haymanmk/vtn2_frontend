import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";

export const OverviewSystemInfo = (props) => {
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
              System
            </Typography>
            <Typography variant="body1">
              <b>Platform: </b>
              {value?.osInfo?.platform}
            </Typography>
            <Typography variant="body1">
              <b>Distro: </b>
              {value?.osInfo?.distro}
            </Typography>
            <Typography variant="body1">
              <b>Codename: </b>
              {value?.osInfo?.codename}
            </Typography>
            {value?.system?.raspberry && (
              <Typography variant="body1">
                <b>Raspberry: </b>
                {value?.system?.raspberry?.type}
              </Typography>
            )}
          </Stack>
          <Avatar sx={{ backgroundColor: "success.main", height: 56, width: 56 }}>
            <ComputerIcon />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};
