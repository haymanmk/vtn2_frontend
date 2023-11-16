import { TextField } from "@mui/material";
import { useCallback } from "react";

export const NumberInput = (props) => {
  const { id, label, type, value, onChange, disabled } = props;

  const handleChangeFloat = useCallback(
    (event) => {
      if (!onChange) return;

      //remove leading 0
      let inputStr = event.target.value.replace(/^0*([0-9]+)/, "$1");
      inputStr = inputStr.replace(/[^0-9\.-]+/, "");
      inputStr = inputStr.replace(/(.+)(-+)(.*)/, (match, p1, p2, p3) => "-" + p1 + p3);
      const regex = /[-]?[0-9]+(\.[0-9]*)?/;
      const matches = inputStr.match(regex);
      if (matches) onChange(id, matches[0]);
      else onChange(id, 0);
    },
    [onChange]
  );
  const handleChangeInt = useCallback(
    (event) => {
      if (!onChange) return;

      let inputStr = event.target.value.replace(
        /(.+)(-+)(.*)/,
        (match, p1, p2, p3) => "-" + p1 + p3
      );
      inputStr = inputStr.replace(/[^0-9-]+/, "");
      const matches = inputStr.match(/[-]{0,1}[0-9]+/);
      if (matches) onChange(id, Number(matches[0]));
      else onChange(id, 0);
    },
    [onChange]
  );

  const handleBlur = useCallback(
    (event) => {
      onChange(id, Number(event.target.value));
    },
    [onChange]
  );

  let handleChange = handleChangeInt;
  switch (type) {
    case "int":
      handleChange = handleChangeInt;
      break;
    case "float":
      handleChange = handleChangeFloat;
      break;
    default:
      console.warn(`Type ${type} is not supported in NumberInput.`);
  }

  return (
    <TextField
      fullWidth
      id={id}
      label={label}
      value={value || 0}
      onChange={handleChange}
      onBlur={handleBlur}
      inputProps={{ inputMode: "text" }}
      disabled={disabled}
    />
  );
};
