import { Card, CardContent, CardHeader, Divider, Grid } from "@mui/material";
import { LabeledSwtich } from "src/components/labeled-switch";

export const OutputStatus = (props) => (
  <Card>
    <CardHeader title="Outputs" />
    <Divider />
    <CardContent>
      <Grid container spacing={3} wrap="wrap">
        {Object.entries(props.inputStatus).map(([input, state]) => (
          <Grid key={input} item>
            <LabeledSwtich
              checked={state}
              onChange={(event) => props.onChange(event, input)}
              label={input}
            />
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </Card>
);
