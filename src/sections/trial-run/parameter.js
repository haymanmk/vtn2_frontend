import { memo, useCallback, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { ControlInput } from "src/components/control-input";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import { StyledSelector } from "src/components/styled-selector";

export const Parameters = memo((props) => {
  const {
    parameters,
    onChange,
    recoverParameters,
    onSubmit,
    xs,
    minWidth = 200,
    minHeight = 300,
    selectedProgram,
    recipeOptions,
    handleRecipeSelect,
  } = props;

  const [editing, setEditing] = useState(false);

  const onClick_Edit = useCallback(
    (event) => {
      if (Object.keys(parameters).length !== 0) setTimeout(() => setEditing(true), 200);
    },
    [setEditing, parameters]
  );

  const onClick_Save = useCallback(
    (event) => {
      onSubmit(event);
      setTimeout(() => setEditing(false), 200);
    },
    [onSubmit, setEditing]
  );

  const onClick_Cancel = useCallback(
    (event) => {
      setTimeout(() => {
        recoverParameters(event);
        setEditing(false);
      }, 200);
    },
    [setEditing]
  );

  return (
    // <Card sx={{ minWidth: minWidth, minHeight: minHeight }}>
    //   <CardHeader
    //     avatar={
    //       <Avatar aria-label="parameters" sx={{}}>
    //         <AssignmentRoundedIcon />
    //       </Avatar>
    //     }
    //     action={
    //       <StyledSelector
    //         variant="standard"
    //         size="small"
    //         value={selectedProgram || ""}
    //         onChange={handleRecipeSelect}
    //         disabled={editing}
    //       >
    //         {recipeOptions &&
    //           recipeOptions.map((option, i) => (
    //             <MenuItem key={i} value={option}>
    //               {option}
    //             </MenuItem>
    //           ))}
    //       </StyledSelector>
    //     }
    //     title="Parameters"
    //     sx={{
    //       "& .MuiCardHeader-action": {
    //         alignSelf: "auto",
    //       },
    //     }}
    //   />
    //   <Divider />
    //   <CardContent>
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box component={"div"} sx={{ marginBottom: "20px" }}>
        <Grid container sx={{ justifyContent: "flex-end" }}>
          <Grid item>
            <StyledSelector
              variant="standard"
              size="small"
              value={selectedProgram || ""}
              onChange={handleRecipeSelect}
              disabled={editing}
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
                <ControlInput id={key} onChange={onChange} disabled={!editing} {...value} />
              </Grid>
            ))}
        </Grid>
      </Box>
      <Divider />
      <Box component={"div"} sx={{ display: "flex", justifyContent: "flex-end" }}>
        {editing && (
          <Button size="small" onClick={onClick_Save}>
            SAVE
          </Button>
        )}
        {editing && (
          <Button size="small" onClick={onClick_Cancel}>
            CANCEL
          </Button>
        )}
        {!editing && (
          <Button size="small" onClick={onClick_Edit}>
            EDIT
          </Button>
        )}
      </Box>
    </Box>
    //   </CardContent>
    //   <Divider />
    //   <CardActions sx={{ justifyContent: "flex-end" }}>
    //     {editing && (
    //       <Button size="small" onClick={onClick_Save}>
    //         SAVE
    //       </Button>
    //     )}
    //     {editing && (
    //       <Button size="small" onClick={onClick_Cancel}>
    //         CANCEL
    //       </Button>
    //     )}
    //     {!editing && (
    //       <Button size="small" onClick={onClick_Edit}>
    //         EDIT
    //       </Button>
    //     )}
    //   </CardActions>
    // </Card>
  );
});
