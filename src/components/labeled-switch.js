import { Switch } from "@mui/material";
import { memo } from "react";
import { createPalette } from "src/theme/create-palette";

export const LabeledSwtich = memo((props) => {
  const { labelPlacement = "end" } = props;
  const palette = createPalette();
  const switchElement = (
    <div>
      <Switch
        id={props.id}
        checked={props.checked || false}
        onChange={props.onChange}
        disabled={props.disabled}
      />
    </div>
  );
  let flexDirection = "row";
  switch (labelPlacement) {
    case "start":
    case "end":
      flexDirection = "row";
      break;
    case "top":
    case "bottom":
      flexDirection = "column";
      break;
    default:
      console.warn(`labelPlacement ${labelPlacement} is not supported in LabeledSwitch.`);
      break;
  }
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: `${flexDirection}`,
        fontSize: "0.75rem",
        fontWeight: "500",
        color: `${props.disabled ? palette.text.disabled : palette.text.secondary}`,
      }}
    >
      {labelPlacement === "start" && <span>{props.label}</span>}
      {labelPlacement === "top" && <p style={{ margin: 0 }}>{props.label}</p>}
      {switchElement}
      {labelPlacement === "end" && <span>{props.label}</span>}
      {labelPlacement === "bottom" && <p style={{ margin: 0 }}>{props.label}</p>}
    </label>
  );
});
