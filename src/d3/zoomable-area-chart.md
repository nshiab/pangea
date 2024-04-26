---
source: https://observablehq.com/@d3/zoomable-area-chart
index: false
draft: true
---

<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Zoomable area chart</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# Zoomable area chart

This zoomable time series area chart shows the number of flights per day. The effect of the September 11, 2001 attacks on air travel is evident.

```js echo
const chart = {

  // Specify the chart’s dimensions.
  const width = 928;
  const height = 500;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 30;

  // Create the horizontal and vertical scales.
  const x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date))
      .range([marginLeft, width - marginRight]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice()
      .range([height - marginBottom, marginTop]);

  // Create the horizontal axis generator, called at startup and when zooming.
  const xAxis = (g, x) => g
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

  // The area generator, called at startup and when zooming.
  const area = (data, x) => d3.area()
      .curve(d3.curveStepAfter)
      .x(d => x(d.date))
      .y0(y(0))
      .y1(d => y(d.value))
    (data);

  // Create the zoom behavior.
  const zoom = d3.zoom()
      .scaleExtent([1, 32])
      .extent([[marginLeft, 0], [width - marginRight, height]])
      .translateExtent([[marginLeft, -Infinity], [width - marginRight, Infinity]])
      .on("zoom", zoomed);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

  // Create a clip-path with a unique ID.
  const clip = DOM.uid("clip");

  svg.append("clipPath")
      .attr("id", clip.id)
    .append("rect")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom);

  // Create the area.
  const path = svg.append("path")
      .attr("clip-path", clip)
      .attr("fill", "steelblue")
      .attr("d", area(data, x));

  // Append the horizontal axis.
  const gx = svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis, x);

  // Append the vertical axis.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("Flights"));

  // When zooming, redraw the area and the x axis.
  function zoomed(event) {
    const xz = event.transform.rescaleX(x);
    path.attr("d", area(data, xz));
    gx.call(xAxis, xz);
  }

  // Initial zoom.
  svg.call(zoom)
    .transition()
      .duration(750)
      .call(zoom.scaleTo, 4, [x(Date.UTC(2001, 8, 1)), 0]);

  return svg.node();
}
```

```js echo
const data = FileAttachment("flights.csv").csv({typed: true});
```