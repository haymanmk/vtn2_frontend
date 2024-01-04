import { memo, useCallback, useEffect, useState } from "react";
import { Box, Button, Divider, Grid, MenuItem } from "@mui/material";
import { ControlInput } from "src/components/control-input";
import { StyledSelector } from "src/components/styled-selector";

export const Parameters = memo((props) => {
  const {
    parameters,
    onChange,
    xs,
    minWidth = 200,
    minHeight = 300,
    selectedProgram,
    recipeOptions,
    handleRecipeSelect,
    disabled,
  } = props;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: 1 }}>
      <Box component={"div"} sx={{ marginBottom: "20px" }}>
        <Grid container sx={{ justifyContent: "flex-end" }}>
          <Grid item>
            <StyledSelector
              variant="standard"
              size="small"
              value={selectedProgram || ""}
              onChange={handleRecipeSelect}
              disabled={disabled}
            >
              {recipeOptions &&
                recipeOptions.map((option, i) => (
                  <MenuItem key={i} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </StyledSelector>
          </Grid>
        </Grid>
      </Box>
      <Box component={"div"} sx={{ flexGrow: 2, marginBottom: "20px" }}>
        <Grid container spacing={3} wrap="wrap">
          {parameters &&
            Object.entries(parameters).map(([key, value]) => (
              <Grid
                key={key}
                item
                xs={xs}
                sx={{ minWidth: minWidth - 50, display: "flex", alignItems: "center" }}
              >
                <ControlInput id={key} onChange={onChange} disabled={!disabled} {...value} />
              </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  );
});
