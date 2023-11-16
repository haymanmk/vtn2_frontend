import { memo } from "react";
import { Avatar, Box, Card, CardContent, CardHeader, Divider, Grid } from "@mui/material";
import { ControlInput } from "src/components/control-input";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";

export const Control = memo((props) => {
  const { controls, onChange, xs, minWidth = 200 } = props;
  return (
    // <Card sx={{ minWidth: minWidth }}>
    //   <CardHeader
    //     avatar={
    //       <Avatar aria-label="control">
    //         <DnsRoundedIcon />
    //       </Avatar>
    //     }
    //     title="Controls"
    //   />
    //   <Divider />
    //   <CardContent>
    <Box>
      <Grid container spacing={3} wrap="wrap" sx={{ alignItems: "center" }}>
        {controls &&
          Object.entries(controls).map(([key, value]) => (
            <Grid
              key={key}
              item
              xs={xs}
              sx={{ minWidth: minWidth - 50, display: "flex", alignItems: "center" }}
            >
              <ControlInput id={key} onChange={onChange} disabled={value?.disabled} {...value} />
            </Grid>
          ))}
      </Grid>
    </Box>
    //   </CardContent>
    // </Card>
  );
});
