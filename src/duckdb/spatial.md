---
index: true
---

# DuckDB spatial

After configuring DuckDB’s [spatial](https://duckdb.org/docs/extensions/spatial/overview.html) [extension](https://observablehq.com/framework/lib/duckdb#extensions), we populate our database with two files:

- **annarbor**, a [GeoParquet](https://geoparquet.org/) file (that I made by converting an old GeoJSON file from a Waldo Tobler project); we can load it directly from the file attachment.
- **us/10m**, TopoJSON’s [US Atlas](https://github.com/topojson/us-atlas) file, that we import with `ST_Read()`.

```js echo
const db = await DuckDBClient.of();

await db.sql([`CREATE OR REPLACE TABLE annarbor AS
  FROM '${FileAttachment("/data/annarbor.parquet").href}';`]);

await db.sql([`CREATE OR REPLACE TABLE counties AS
  FROM ST_Read('${import.meta.resolve("npm:us-atlas@3/counties-10m.json")}')`]);
```

---

The map below shows the shape of Ann Arbor. The geometry information is decoded from GeoParquet, then converted to GeoJSON text (with `ST_AsGeoJSON`), then parsed into an actual JavaScript Object.

```js echo
Plot.plot({
  projection: {
    type: "mercator",
    domain: {
      type: "GeometryCollection",
      geometries: Array.from(annarbor, (d) => d.geometry)
    }
  },
  color: {scheme: "blues", range: [0.2, 1]},
  marks: [
    Plot.geo(annarbor, {
      geometry: "geometry",
      stroke: "var(--theme-background-alt)",
      strokeWidth: 0.25,
      fill: (d, i) => i
    })
  ]
})
```

```js
display(annarbor);
```

```js echo
const annarbor = Array.from(
  await db.sql`
SELECT * REPLACE(ST_AsGeoJSON(geometry) AS geometry) FROM annarbor;`,
  (d) => ({...d, geometry: JSON.parse(d.geometry)})
);
```

---

The **geom** field in the US file is simpler to handle, as it is directly encoded as a `ST_GEOMETRY`, the internal format used by DuckDB spatial. However, we still have a double decoding to do, with `ST_AsGeoJSON` to get a GeoJSON text, then to JavaScript.

DuckDB spatial allows us to do geometric computations, let’s measure the area of each county:

```js
display(counties);
```

```js echo
const counties = Array.from(
  await db.sql`
SELECT *
       REPLACE (ST_AsGeoJSON(geom) AS geom)
     , ST_Area(ST_Transform(geom, 'NULL', 'ESRI:54034')) as area
  FROM counties
`,
  ({geom, ...properties}) => Object.assign(JSON.parse(geom), {properties})
);
```

Wow! What is that formula? 🤯 We want the counties’ areas in m² or km², so we have to project the shapes to an adequate [CRS](https://en.wikipedia.org/wiki/Spatial_reference_system). As an equal area projection with units in meters, [ESRI:54034](https://epsg.io/54034) fits the bill. Our original data comes with [*longitude*, *latitude*] coordinates, which is almost like [WGS84](https://fr.wikipedia.org/wiki/WGS_84), except the coordinates are flipped (in WGS84 _lat_ comes first, then _lon_). Using 'NULL' as the source CRS defaults to the default GeoJSON order [*lon*, *lat*].

```js echo
Plot.plot({
  projection: "albers-usa",
  color: {type: "log", scheme: "sinebow", legend: true, ticks: 5, label: "County area (km²)"},
  marks: [
    Plot.geo(counties, {
      stroke: "var(--theme-background-alt)",
      strokeWidth: 0.25,
      fill: (d) => Math.max(3.5, Math.round(d.properties.area / 1_000_000)),
      tip: {
        channels: {
          id: (d) => d.properties.id,
          name: (d) => d.properties.name,
        }
      }
    })
  ]
})
```

A more useful example —suggested by [Éric Mauvière](https://observablehq.com/user/@ericmauviere)— is to use DuckDB to join the geo shapes and an unemployment dataset. For example to make a [choropleth](/plot/choropleth) map:

```js echo
Plot.plot({
  projection: "albers-usa",
  color: {
    type: "quantize",
    n: 9,
    domain: [1, 10],
    scheme: "blues",
    label: "Unemployment rate (%)",
    legend: true
  },
  marks: [
    Plot.geo(unemployment, {
      fill: d => d.properties.rate, tip: {
        channels: {
          id: d => d.properties.id,
          state: d => d.properties.state,
          county: d => d.properties.county
        }
      }
    })
  ]
})
```

```js
display(unemployment)
```

```js echo
const unemployment = Array.from(
  await db.sql([`
WITH values AS (FROM '${FileAttachment("/data/unemployment-by-county.csv").href}')

SELECT ST_AsGeoJSON(geom) AS geometry
     , values.*
  FROM counties
  JOIN values
    ON counties.id = values.id
` ]),
  ({geometry, ...properties}) => Object.assign(JSON.parse(geometry), {properties})
);
```

---

For more on the SPATIAL extension, read [Introducing The DuckDB Spatial Extension](https://duckdb.org/2023/04/28/spatial.html), by Max Gabrielsson. And this [interesting notebook](https://observablehq.com/@chrispahm/prototyping-geoparquet-geos-in-webassembly) by Christoph Pahmeyer exploring fast GeoParquet visualizations in Observable notebooks. For a complete pipeline, see also [lonboard](https://developmentseed.org/blog/2023-10-23-lonboard), by Kyle Barron.
