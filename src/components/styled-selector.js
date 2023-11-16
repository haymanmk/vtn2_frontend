import { TextField } from "@mui/material";
import { styled } from "@mui/system";
import { memo } from "react";

const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiFilledInput-root": {
    borderColor: "white",
  },
  "& .MuiFilledInput-input": {
    padding: "2px 2px 2px 8px",
  },
}));

export const StyledSelector = memo((props) => (
  <StyledInput
    select
    variant={props.variant}
    size={props.small}
    value={props.value}
    onChange={props.onChange}
    helperText={props.helperText}
    disabled={props.disabled}
  >
    {props.children}
  </StyledInput>
));
