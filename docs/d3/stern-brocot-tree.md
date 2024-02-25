---
index: false
status: draft
---

```js
md`
# Stern–Brocot Tree
`;
```

```js
const chart = {
  const root = tree(data);

  const svg = d3.select(DOM.svg(width, height))
      .attr("viewBox", `0 ${-margin} ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto")
      .style("font", "10px sans-serif");

  svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
  .selectAll("path")
    .data(root.links())
    .enter().append("path")
      .attr("d", d3.linkVertical()
          .source(d => [d.source.x, d.source.y + 12])
          .target(d => [d.target.x, d.target.y - 12]));

  const label = svg.append("g")
      .attr("text-anchor", "middle")
  .selectAll("g")
    .data(root.descendants())
    .enter().append("g")
      .attr("transform", d => `translate(${Math.round(d.x)},${Math.round(d.y)})`);

  label.append("line")
      .attr("x1", -5)
      .attr("x2", 5)
      .attr("stroke", "black");

  label.append("text")
      .datum(d => collapse(d.data.value))
      .call(t => t.append("tspan").attr("y", -2.5).text(d => d[0]))
      .call(t => t.append("tspan").attr("x", 0).attr("y", 9.5).text(d => d[1]));

  return svg.node();
}
```

```js
md`Every positive rational number ${tex`q`} may be expressed as a finite continued fraction

${tex.block`q=a_{0}+{\dfrac{1}{a_{1}+{\dfrac{1}{a_{2}+{\dfrac{1}{a_{3}+{\dfrac{1}{\ddots+{\dfrac {1}{a_{k}}}}}}}}}}}=[a_{0};a_{1},a_{2},\ldots,a_{k}]`}

where ${tex`k`} and ${tex`a_0`} are non-negative integers and each subsequent coefficient ${tex`a_i`} is a positive integer. The numbers can be arranged in a binary tree with the root ${tex`[0;1]`}. Each number ${tex`q`} then has the children:

${tex.block`\begin{aligned}
&[a_{0};a_{1},a_{2},\ldots ,a_{k}+1]\\
&[a_{0};a_{1},a_{2},\ldots ,a_{k}-1,2]
\end{aligned}`}

The first child is less than ${tex`q`} if ${tex`k`} is odd, and greater than ${tex`q`} if ${tex`k`} is even. For instance, the continued fraction representation of ${tex`\tfrac{13}{9}`} is ${tex`[1;2,4]`} and its two children are ${tex`[1;2,5] = \tfrac{16}{11}`} and ${tex`[1;2,3,2] = \tfrac{23}{16}`}.

*Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Stern–Brocot_tree).*`;
```

```js
md`
---

## Appendix
`;
```

```js echo
const data = {
  const root = {value: [0, 1]};
  const queue = [root];
  let p, size = 0, n = 1 << 6;
  while (++size < n && (p = queue.shift())) {
    const k = p.value.length - 1;
    const a = {value: p.value.slice(0, k).concat(p.value[k] + 1)};
    const b = {value: p.value.slice(0, k).concat(p.value[k] - 1, 2)};
    p.children = k & 1 ? [a, b] : [b, a];
    queue.push(a, b);
  }
  return root;
}
```

```js echo
function collapse(f) {
  let n = 1,
    d = 0,
    i = f.length;
  while (--i >= 0) [n, d] = [f[i] * n + d, n];
  return [n, d];
}
```

```js echo
const tree = (data) =>
  d3
    .tree()
    .size([width, height - margin * 2])
    .separation(() => 1)(d3.hierarchy(data));
```

```js echo
const width = 954;
```

```js echo
const height = 600;
```

```js echo
const margin = 20;
```

```js echo
const d3 = require("d3@5");
```