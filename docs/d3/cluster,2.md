<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Cluster tree</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# Cluster tree

D3’s [cluster layout](https://d3js.org/d3-hierarchy/cluster) produces node-link diagrams with leaf nodes at equal depth. These are less compact than [tidy trees](/@d3/tree/2?intent=fork), but are useful for dendrograms, hierarchical clustering, and [phylogenetic trees](/@d3/tree-of-life). See also the [radial variant](/@d3/radial-cluster/2?intent=fork).

```js echo
chart = {
  const width = 928;

  // Compute the tree height; this approach will allow the height of the
  // SVG to scale according to the breadth (width) of the tree layout.
  const root = d3.hierarchy(data);
  const dx = 10;
  const dy = width / (root.height + 1);

  // Create a tree layout.
  const tree = d3.cluster().nodeSize([dx, dy]);

  // Sort the tree and apply the layout.
  root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
  tree(root);

  // Compute the extent of the tree. Note that x and y are swapped here
  // because in the tree layout, x is the breadth, but when displayed, the
  // tree extends right rather than down.
  let x0 = Infinity;
  let x1 = -x0;
  root.each(d => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
  });

  // Compute the adjusted height of the tree.
  const height = x1 - x0 + dx * 2;

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-dy / 3, x0 - dx, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
    .selectAll()
      .data(root.links())
      .join("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));
  
  const node = svg.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
    .selectAll()
    .data(root.descendants())
    .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle")
      .attr("fill", d => d.children ? "#555" : "#999")
      .attr("r", 2.5);

  node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -6 : 6)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .attr("stroke", "white")
      .attr("paint-order", "stroke");
  
  return svg.node();
}
```

Using [Observable Plot](/plot/)’s concise API, this chart can simply be written as:

```js echo
Plot.plot({
  axis: null,
  margin: 10,
  marginLeft: 40,
  marginRight: 160,
  width: 928,
  height: 2500,
  marks: [
    Plot.cluster(flare, {path: "name", delimiter: "."})
  ]
})
```

```js echo
data = FileAttachment("flare.json").json()
```