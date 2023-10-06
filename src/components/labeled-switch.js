import { Switch } from "@mui/material";
import { memo } from "react";

export const LabeledSwtich = memo((props) => {
  return (
    <label style={{ display: "inline-flex", alignItems: "center" }}>
      <Switch
        checked={props.checked || false}
        onChange={props.onChange}
        disabled={props.disabled}
      />
      <span>{props.label}</span>
    </label>
  );
});
