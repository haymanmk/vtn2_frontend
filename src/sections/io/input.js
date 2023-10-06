import { Card, CardContent, CardHeader, Divider, Grid } from "@mui/material";
import { LabeledSwtich } from "src/components/labeled-switch";

export const InputStatus = (props) => (
  <Card>
    <CardHeader title="Inputs" />
    <Divider />
    <CardContent>
      <Grid container spacing={3} wrap="wrap">
        {Object.entries(props.inputStatus).map(([input, state]) => (
          <Grid key={input} item>
            <LabeledSwtich checked={state} label={input} />
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </Card>
);
