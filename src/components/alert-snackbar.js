import { Box, Container, Divider, Grid, Paper, Snackbar, Stack } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CloseIcon from "@mui/icons-material/Close";
import { error } from "src/theme/colors";
import { styled } from "@mui/system";
import { useSelector } from "react-redux";

const FadeOutTextbox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "fontColor",
})((props) => {
  return {
    backgroundImage: `linear-gradient(${props.fontColor} 70%, transparent)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bold",
  };
});

export const AlertSnackbar = (props) => {
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const errorLogSelector = useSelector((state) => state.MQTTClient.error_logs);
  const errorMessage = useMemo(() => {
    if (errorLogSelector.length) return errorLogSelector[errorLogSelector.length - 1]?.msg?.message;
  }, [errorLogSelector]);

  useEffect(() => {
    if (errorLogSelector.length)
      if ("open_snackbar" in errorLogSelector[errorLogSelector.length - 1]) setOpen(true);
  }, [errorLogSelector]);

  const onClickHandler = useCallback(
    (event) => {
      if (event?.which === 1 || event?.button === 0)
        setOpenDetail((prev) => {
          return !prev;
        });
    },
    [setOpenDetail]
  );

  const onClickCloseIconHandler = useCallback(
    (event) => {
      if (event?.which === 1 || event?.button === 0) {
        setOpen(false);
        setOpenDetail(false);
      }
    },
    [setOpen, setOpenDetail]
  );

  return (
    <Snackbar open={open} sx={{ cursor: "pointer" }}>
      <Box
        sx={{
          width: "200px",
          maxHeight: "250px",
          backgroundColor: error.main,
          p: 1,
          borderRadius: 1,
          boxShadow: "0px 4px 10px rgb(0 0 0 / 50%)",
        }}
      >
        <Stack direction={"column"} spacing={1} sx={{ color: "white" }}>
          <Stack
            direction={"row"}
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <ErrorOutlineIcon onClick={onClickHandler} />
            <Container onClick={onClickHandler} component={"p"} sx={{ m: 0 }}>
              ERROR
            </Container>
            <CloseIcon onMouseDown={onClickCloseIconHandler} />
          </Stack>
          {openDetail && (
            <Stack direction={"column"}>
              <Divider sx={{ borderColor: "rgb(255 255 255 /40%)" }} />
              <FadeOutTextbox
                onClick={onClickHandler}
                component={"p"}
                fontColor={"white"}
                sx={{
                  px: 0.5,
                  maxHeight: "180px",
                  overflowY: "hidden",
                  overflowWrap: "break-word",
                }}
              >
                {errorMessage}
              </FadeOutTextbox>
            </Stack>
          )}
        </Stack>
      </Box>
    </Snackbar>
  );
};
