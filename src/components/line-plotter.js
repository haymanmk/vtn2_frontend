import { useRef, useEffect, useState, memo, useCallback } from "react";
import * as d3 from "d3";
import { indigo, neutral, success, warning } from "src/theme/colors";
import styles from "./line-plotter.module.css";

const colors = [indigo.main, neutral[500], warning.main, success.main];

export const LinePlotter = (props) => {
  const {
    brushed,
    data,
    width = 150,
    height = 150,
    marginTop = 20,
    marginRight = 20,
    marginBottom = 40,
    marginLeft = 40,
    amountLines = 1,
    options = {
      y_label_pos: "side", // alternatives: "side", "top"
      x_lable: "sec",
      y_labels: ["mbar"],
    },
  } = props;

  // canvas area settings
  const [PLOT_AREA_WIDTH, set_PLOT_AREA_WIDTH] = useState(0);
  const [PLOT_AREA_HEIGHT, set_PLOT_AREA_HEIGHT] = useState(0);
  const [OFFSET_X_AXIS_LABLE, set_OFFSET_X_AXIS_LABLE] = useState(0);
  const [OFFSET_Y_AXIS_LABLE, set_OFFSET_Y_AXIS_LABLE] = useState(0);
  const FONTSIZE_LABLE = 12; //pixel
  const CLEARANCE_Y_AXES = 10; //pixel

  // reference
  const divRef = useRef();
  const gRef = useRef();
  const xAxis = useRef();
  const tooltip = useRef();

  /**
   * Calculate canvas dimension
   */
  useEffect(() => {
    if (amountLines) {
      set_PLOT_AREA_WIDTH(width - (marginLeft + CLEARANCE_Y_AXES) * amountLines - marginRight);
      set_PLOT_AREA_HEIGHT(height - marginTop - marginBottom);
      set_OFFSET_X_AXIS_LABLE(marginBottom - FONTSIZE_LABLE);
      // set_OFFSET_Y_AXIS_LABLE(-(marginLeft - FONTSIZE_LABLE));
    }
  }, [
    amountLines,
    width,
    height,
    set_PLOT_AREA_WIDTH,
    set_PLOT_AREA_HEIGHT,
    set_OFFSET_X_AXIS_LABLE,
    set_OFFSET_Y_AXIS_LABLE,
  ]);

  /**
   * Organize Axes on Canvas
   */
  useEffect(() => {
    if (!amountLines) return;

    d3.select(divRef.current).selectAll(styles.tooltip).remove();
    // create tooltip
    if (!tooltip.current)
      tooltip.current = d3
        .select(divRef.current)
        // .select("body")
        .append("div")
        .attr("class", styles.tooltip)
        .style("opacity", 0);

    // append plot-area group
    const g = d3
      .select(gRef.current)
      .attr(
        "transform",
        `translate(${(marginLeft + CLEARANCE_Y_AXES) * amountLines},${marginTop})`
      );

    // remove all contents
    g.selectAll("*").remove();

    // append initial x, y Scales
    $xScale.domain([0, 100]);

    // append x axis
    xAxis.current = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${PLOT_AREA_HEIGHT})`)
      .call($xAxis);
    // add x axis label
    g.append("text")
      .attr("class", "x-label")
      .attr("font-size", FONTSIZE_LABLE)
      .attr("text-anchor", "middle")
      .attr("x", PLOT_AREA_WIDTH / 2)
      .attr("y", PLOT_AREA_HEIGHT + OFFSET_X_AXIS_LABLE)
      .text(options.x_label);

    // append y axis
    $appendYAxes(g, amountLines, PLOT_AREA_HEIGHT);

    // append <path> for lines
    for (let i = 0; i < amountLines; i++) g.append("path").attr("class", $classNameLine(i));

    // add brush
    if (brushed) g.append("g").attr("class", "brush").call($brush);

    return () => {
      d3.selectAll(styles.tooltip).remove();
    };
  }, [
    gRef,
    amountLines,
    options,
    PLOT_AREA_WIDTH,
    PLOT_AREA_HEIGHT,
    OFFSET_X_AXIS_LABLE,
    OFFSET_Y_AXIS_LABLE,
  ]);

  /**
   * Draw Lines
   */
  useEffect(() => {
    if (!data) return;
    if (data?.length <= 0) return;

    // remove tooltip to keep canvas clean
    tooltip.current.style("opacity", 0);

    // update x scale
    $xScale.domain($extent(data, 0));
    xAxis.current?.call($xAxis);

    // update lines and y axes
    let g = d3.select(gRef.current);
    if (Array.isArray(data[0][0])) {
      data.forEach((arr, index) => $updateLine(g, arr, index, colors[index]));
    } else $updateLine(g, data, 0, colors[0]);
  }, [
    gRef.current,
    xAxis.current,
    data,
    PLOT_AREA_WIDTH,
    PLOT_AREA_HEIGHT,
    OFFSET_X_AXIS_LABLE,
    OFFSET_Y_AXIS_LABLE,
  ]);

  // x scale
  const $xScale = d3.scaleLinear().range([0, PLOT_AREA_WIDTH]).nice();

  // y scale
  const $yScale = d3.scaleLinear().range([PLOT_AREA_HEIGHT, 0]).nice();

  // x axis
  const $xAxis = d3.axisBottom($xScale);

  // y axis
  const $yAxis = d3.axisLeft($yScale);

  // append y axes
  const $appendYAxes = (g, numAxes, plot_area_height) => {
    $yScale.domain([0, 100]);
    for (let i = 0; i < numAxes; i++) {
      const color = colors[i];
      let yAxis = g
        .append("g")
        .attr("class", $classNameYAxis(i))
        .attr("transform", `translate(${-(marginLeft + CLEARANCE_Y_AXES) * i}, 0)`)
        .call($yAxis);
      yAxis.selectAll("path").attr("stroke", color);
      yAxis.selectAll("line").attr("stroke", color);
      yAxis.selectAll("text").attr("fill", color);

      // append y axis label
      let y_label = g
        .append("text")
        .attr("class", $classNameYLabel(i))
        .style("fill", color)
        .attr("font-size", FONTSIZE_LABLE)
        .attr("text-anchor", "middle");
      if ("y_labels" in options) {
        if (options.y_labels[i]) y_label.text(options.y_labels[i]);
        if (options.y_label_pos === "side")
          y_label
            .attr("x", -plot_area_height / 2)
            .attr("y", -(marginLeft * (i + 1) - FONTSIZE_LABLE + CLEARANCE_Y_AXES * i))
            .attr("transform", "rotate(-90)");
        else if (options.y_label_pos === "top")
          y_label
            .attr("text-anchor", "end")
            .attr("x", -marginLeft * i - CLEARANCE_Y_AXES * i)
            .attr("y", -FONTSIZE_LABLE);
      }
    }
  };

  // line
  const $line = d3
    .line()
    .x((d) => $xScale(d[0]))
    .y((d) => $yScale(d[1]));

  // update line
  const $updateLine = (g, data, index, color) => {
    // updata y axis
    $yScale.domain(d3.extent(data, (d) => d[1]));
    let yAxis = g.select(`.${$classNameYAxis(index)}`);
    yAxis.call($yAxis);
    yAxis.selectAll("path").attr("stroke", color);
    yAxis.selectAll("line").attr("stroke", color);
    yAxis.selectAll("text").attr("fill", color);

    // draw line
    let linePath = g.select(`.${$classNameLine(index)}`);
    linePath
      .datum(data)
      .attr("d", $line)
      .attr("fill", "none")
      .attr("stroke-width", "2px")
      .attr("stroke", color);

    // append dots
    g.selectAll("dot")
      .data(data)
      .join("circle")
      .attr("cx", (d) => $xScale(d[0]))
      .attr("cy", (d) => $yScale(d[1]))
      .attr("r", 3.5)
      .style("fill", color)
      .on("mouseover", (event, d) => {
        console.log("event", event);
        tooltip.current.transition().duration(200).style("opacity", 0.7);
        tooltip.current
          .html(`x: ${Number(d[0]).toFixed(2)}<br/>y: ${Number(d[1].toFixed(2))}`)
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 36 + "px");
      })
      .on("mouseout", (d) => {
        tooltip.current.transition().duration(200).style("opacity", 0);
      });
  };

  // brush
  const $brush = d3
    .brushX()
    .extent([
      [0, 0],
      [PLOT_AREA_WIDTH, PLOT_AREA_HEIGHT],
    ])
    .on("start brush end", brushed);

  // tick
  // update

  // find extent
  const $extent = (data, direction) => {
    if (Array.isArray(data[0][0])) {
      let min = data[0][0][direction];
      let max = min;

      data.forEach((arr, index) => {
        if (index > amountLines - 1) return;

        arr.forEach((p) => {
          const d = p[direction];
          min = d < min ? d : min;
          max = d > max ? d : max;
        });
      });
      return [min, max];
    } else return d3.extent(data, (d) => d[direction]);
  };

  // class names
  const $classNameYAxis = (i) => `y-axis-${i}`;
  const $classNameYLabel = (i) => `y-label-${i}`;
  const $classNameLine = (i) => `line-data-${i}`;

  return (
    <div ref={divRef} className="line-chart" style={{ display: "flex", justifyContent: "center" }}>
      <svg width={width} height={height}>
        <g ref={gRef}></g>
      </svg>
    </div>
  );
};
