import { Slider } from "@mui/material";

export const SliderWithMetric = ({ value, max, min, metricMin, metricMax, ...rest }) => {
  let marks = [
    // { value: min, label: `${min}` },
    { value: metricMin, label: `${metricMin}` },
    { value: metricMax, label: `${metricMax}` },
    // { value: max, label: `${max}` },
  ];

  return (
    <Slider
      {...rest}
      value={value}
      max={max}
      min={min}
      marks={marks}
      color={!(value > metricMin && value < metricMax) ? "error" : "success"}
    />
  );
};
