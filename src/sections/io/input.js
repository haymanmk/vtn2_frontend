import { Card, CardContent, CardHeader, Divider, Grid } from "@mui/material";
import { LabeledSwtich } from "src/components/labeled-switch";
import { memo, useMemo } from "react";
import { ControlInput } from "src/components/control-input";

const InputStatus = (props) => {
  const inputStatus = useMemo(() => props.inputStatus, [props.inputStatus]);
  return (
    <Card>
      <CardHeader title="Inputs" />
      <Divider />
      <CardContent>
        <Grid container spacing={3} wrap="wrap">
          {Object.entries(inputStatus).map(([key, value]) => (
            <Grid key={key} item>
              <ControlInput id={key} disabled={props.disabled} {...value} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default memo(InputStatus);
