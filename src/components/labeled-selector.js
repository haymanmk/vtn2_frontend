import { MenuItem, Select, TextField } from "@mui/material";
import { memo, useCallback } from "react";

export const LabeledSelector = memo((props) => {
  const { id, label, value, onChange, options, disabled } = props;

  const handleChange = useCallback(
    (event) => {
      onChange(id, event.target.value);
    },
    [onChange]
  );
  return (
    <>
      <TextField
        fullWidth
        select
        id={id}
        label={label}
        value={value || 0}
        onChange={handleChange}
        disabled={disabled}
      >
        {options &&
          options.map((value, i) => (
            <MenuItem key={i} value={i}>
              {value}
            </MenuItem>
          ))}
      </TextField>
    </>
  );
});
