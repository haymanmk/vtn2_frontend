import { memo } from "react";
import { NumberInput } from "./number-input";
import { LabeledSelector } from "./labeled-selector";
import { Button, TextField } from "@mui/material";
import { LabeledSwtich } from "./labeled-switch";

export const ControlInput = memo((props) => {
  const { onChange = () => {}, id, label, type, value, disabled } = props;

  switch (type) {
    case "number":
    case "int":
    case "float":
      return <NumberInput {...props} />;
    case "bool":
      return (
        <LabeledSwtich
          labelPlacement="start"
          id={id}
          checked={value}
          onChange={(event) => onChange(id, event.target.checked)}
          disabled={disabled}
          label={label}
        />
      );
    case "text":
      return (
        <TextField
          fullWidth
          id={id}
          label={label}
          value={value || ""}
          disabled={disabled}
          onChange={(event) => onChange(id, event.target.value)}
        />
      );
    case "select":
      return <LabeledSelector {...props} />;
    case "button":
      return (
        <Button
          variant="contained"
          id={id}
          onClick={(event) => onChange(id, true)}
          disabled={disabled}
        >
          {label}
        </Button>
      );
    default:
      console.warn(`Type ${type} is not supported in ControlItem.`);
  }
});
