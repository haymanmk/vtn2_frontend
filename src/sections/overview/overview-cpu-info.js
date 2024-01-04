import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";
import MemoryIcon from "@mui/icons-material/Memory";

export const OverviewCPUInfo = (props) => {
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
              CPU
            </Typography>
            <Typography variant="body1">
              <b>Brand: </b>
              {value?.cpu?.brand}
            </Typography>
            <Typography variant="body1">
              <b>Family: </b>
              {value?.cpu?.family}
            </Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: "warning.main", height: 56, width: 56 }}>
            <MemoryIcon />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};
