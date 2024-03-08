import { Avatar, Box, Card, CardContent, CardHeader, Divider, Grid, MenuItem } from "@mui/material";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { LinePlotter } from "src/components/line-plotter";
import SsidChartRoundedIcon from "@mui/icons-material/SsidChartRounded";
import { StyledSelector } from "src/components/styled-selector";

const MAX_LINES = 4;

const countAmountLines = (data) => {
  const errorMsg = "Line data shall be array. e.g. [[time1, data1], [time2, data2]]";
  let amountLines = 0;
  if (!data) return;
  if (!Array.isArray(data)) {
    console.error(`${errorMsg}: exit 1`);
    return;
  }
  data.every((arr) => {
    if (!Array.isArray(arr)) {
      console.error(`${errorMsg}: exit 2`);
      return false;
    }
    if (Array.isArray(arr[0])) {
      if (arr[0].length !== 2) {
        console.error(`${errorMsg}: exit 3`);
        return false;
      }
      amountLines++;
      if (amountLines >= MAX_LINES) return false;
      return true;
    } else {
      if (arr.length !== 2) {
        console.error(`${errorMsg}: exit 4`);
        amountLines = null;
        return false;
      }
      amountLines += 1;
      return false;
    }
  });
  return amountLines;
};

export const GraphPlotter = memo((props) => {
  const { data, minWidth, brushed, options } = props;
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(150);
  const [_lineOptions, setLineOptions] = useState([]); // available line options, e.g. ["all", "mbar", "temp", "flow"]
  const [selectedLine, setSelectedLine] = useState("all");
  const [selectedData, setSelectedData] = useState([]);
  const [yLabel, setYLabel] = useState([]);
  const [numLines, setNumLines] = useState(0);
  const boxRef = useRef();
  const amountLines = useRef(0);

  // hook for data change
  useEffect(() => {
    amountLines.current = countAmountLines(data);
    setNumLines(amountLines.current < MAX_LINES ? amountLines.current : MAX_LINES);
    if (amountLines.current <= 1) return;

    if (selectedLine === "all") {
      setSelectedData(data);
      setNumLines(amountLines.current);
    } else {
      const index = _lineOptions.findIndex((e) => e === selectedLine);
      setSelectedData(data[index - 1]);
      setNumLines(1);
    }
  }, [data, _lineOptions, selectedLine, setSelectedData, setNumLines, setNumLines]);

  // update y labels
  useEffect(() => {
    if ("y_labels" in options)
      if (selectedLine === "all") {
        setYLabel(options.y_labels);
      } else {
        const index = _lineOptions.findIndex((e) => e === selectedLine);
        setYLabel([options.y_labels[index - 1]]);
      }
  }, [options, selectedLine, _lineOptions, setYLabel]);

  // hook for options change
  useEffect(() => {
    let _options = ["all"];
    if ("y_labels" in options)
      if (options.y_labels.length) {
        _options = [..._options, ...options.y_labels.slice(0, MAX_LINES)];
      }

    for (let i = _options.length; i < amountLines.current; i++) _options.push(`${i}`);

    setLineOptions(_options);
  }, [options, setLineOptions]);

  useEffect(() => {
    if (!boxRef.current) return;
    const resizeObzerver = new ResizeObserver(() => {
      setWidth(boxRef.current?.clientWidth);
      setHeight(boxRef.current?.clientHeight);
    });
    resizeObzerver.observe(boxRef.current);

    return () => {
      resizeObzerver.disconnect();
    };
  }, [boxRef, setWidth, setHeight]);

  const handleLineSelectChange = useCallback(
    (event) => {
      const value = event.target.value;
      setSelectedLine(value);
    },
    [setSelectedLine]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {amountLines.current > 1 && (
        <Box sx={{ marginBottom: "20px" }}>
          <Grid container sx={{ justifyContent: "flex-end" }}>
            <Grid item>
              {_lineOptions.length && (
                <StyledSelector
                  variant="standard"
                  size="small"
                  value={selectedLine}
                  onChange={handleLineSelectChange}
                >
                  {_lineOptions.map((option, i) => (
                    <MenuItem key={i} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </StyledSelector>
              )}
            </Grid>
          </Grid>
        </Box>
      )}
      <Box
        ref={boxRef}
        sx={{
          display: "flex",
          flexFlow: 2,
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <LinePlotter
          data={selectedData}
          brushed={brushed}
          width={width}
          height={height}
          amountLines={numLines}
          options={{ ...options, y_labels: yLabel }}
        />
      </Box>
    </Box>
  );
});
