import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { memo, useEffect, useRef, useState } from "react";
import { info, warning, error } from "src/theme/colors";

export const LogViewer = memo((props) => {
  const { maxHeight = 350, logs, minWidth = 200 } = props;
  const COLUMNS = [
    { id: "timestamp", label: "timestamp", align: "center", width: "25%" },
    { id: "message", label: "message", align: "center" },
  ];

  const [hydrated, setHydrated] = useState(false);
  const tableRef = useRef();
  const latestRowRef = useRef();
  const hoverOnTableRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    function mouseoverCallback(event) {
      hoverOnTableRef.current = true;
    }
    function mouseleaveCallback(event) {
      hoverOnTableRef.current = false;
    }
    if (tableRef.current) {
      tableRef.current.addEventListener("pointerover", mouseoverCallback);
      tableRef.current.addEventListener("pointerleave", mouseleaveCallback);
    }

    return () => {
      if (tableRef.current) {
        tableRef.current.removeEventListener("pointerover", mouseoverCallback);
        tableRef.current.removeEventListener("pointerleave", mouseleaveCallback);
      }
    };
  }, [tableRef.current, hoverOnTableRef.current]);

  useEffect(() => {
    if (hoverOnTableRef.current) return;
    if (latestRowRef.current) {
      const rowTopPos = latestRowRef.current.offsetTop;
      const scrollTop = tableRef.current.scrollTop;
      const diff = rowTopPos - scrollTop;

      tableRef.current.scrollBy({ top: diff, behavior: "smooth" });
    }
  }, [latestRowRef.current, hoverOnTableRef.current, hydrated]);

  if (!hydrated) return null;

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: maxHeight }} ref={tableRef}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableCell key={column.id} align={column.align} style={{ width: column.width }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length
              ? logs.map(({ cmd, msg }, i) => {
                  if (!msg) return;
                  const { timestamp, message } = msg;
                  let color = "initial";
                  let tag = "INFO";
                  switch (cmd) {
                    case "info":
                      color = info.main;
                      tag = "INFO";
                      break;
                    case "warn":
                      color = warning.main;
                      tag = "WARN";
                      break;
                    case "error":
                      color = error.main;
                      tag = "ERROR";
                      break;
                  }

                  return (
                    <TableRow hover key={i} ref={i === logs.length - 1 ? latestRowRef : null}>
                      <TableCell align="right" sx={{ paddingY: 0 }}>
                        {new Date(timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell align="left" sx={{ paddingY: 0 }}>
                        <p style={{ color: color }}>
                          <b>[{tag}] </b>
                          <span>{JSON.stringify(message)}</span>
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })
              : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});
