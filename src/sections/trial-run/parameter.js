import { memo, useCallback, useEffect, useState } from "react";
import { Box, Button, Divider, Grid, List, MenuItem } from "@mui/material";
import { ControlInput } from "src/components/control-input";
import { StyledSelector } from "src/components/styled-selector";
import { TreeViewInput } from "src/components/tree-view-input";

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
              // disabled={disabled}
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
      <Box component={"div"} sx={{ flexGrow: 2, marginBottom: "20px", overflowY: "scroll" }}>
        <List>
          <TreeViewInput
            value={parameters}
            onChange={onChange}
            expandAll={true}
            collapseAll={false}
            disabled={disabled}
          />
        </List>
      </Box>
    </Box>
  );
});
