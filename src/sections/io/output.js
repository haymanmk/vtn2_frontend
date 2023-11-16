import { Card, CardContent, CardHeader, Divider, Grid } from "@mui/material";
import { LabeledSwtich } from "src/components/labeled-switch";
import { memo, useMemo } from "react";
import { ControlInput } from "src/components/control-input";

const OutputStatus = (props) => {
  const { onChange, disabled } = props;
  const outputStatus = useMemo(() => props.outputStatus, [props.outputStatus]);
  return (
    <Card>
      <CardHeader title="Outputs" />
      <Divider />
      <CardContent>
        <Grid container spacing={3} wrap="wrap">
          {Object.entries(outputStatus).map(([key, value]) => (
            <Grid key={key} item>
              <ControlInput id={key} onChange={onChange} disabled={disabled} {...value} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default memo(OutputStatus);
