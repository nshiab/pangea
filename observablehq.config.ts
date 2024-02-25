const FOOTER_OBSERVABLE = `<p>Built with <a href="https://observablehq.com/" target="_blank">Observable</a> on <a title="${new Date().toISOString()}">${new Date()
  .toISOString()
  .slice(0, 10)}</a>.</p>`;

// https://vercel.com/fil/pangea/settings
const VERCEL_USER_ID = "Gqs9rlMU1BvoK9jKM2glOzEl";
const VERCEL_PROJECT_ID = "prj_BBG643i8KOAgNQkQt9wVyJ2NryNK";

// https://vercel.com/docs/speed-insights
const VERCEL_SPEED_INSIGHTS = `<script>window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };</script><script defer src="/_vercel/speed-insights/script.js"></script>`;

// https://vercel.com/docs/analytics
const VERCEL_WEB_ANALYTICS = `<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script><script defer src="/_vercel/insights/script.js"></script>`;

// https://vercel.com/docs/workflow-collaboration/vercel-toolbar/in-production-and-localhost/add-to-production
const VERCEL_COMMENTS = `
<script
  src="https://vercel.live/_next-live/feedback/feedback.js"
  data-explicit-opt-in="true"
  data-owner-id="${VERCEL_USER_ID}"
  data-project-id="${VERCEL_PROJECT_ID}"
  data-branch="main"
></script>
`;

// See https://observablehq.com/framework/config for documentation.
export default {
  // The project’s title; used in the sidebar and webpage titles.
  title: "Pangea Proxima",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    /*
    {
      name: "D3",
      pages: [
        {name: "Graphs", path: "d3/graphs"},
        {name: "Maps", path: "d3/maps"}
      ]
    },
    {
      name: "Plot",
      pages: [
        {name: "Delaunay, Voronoi", path: "plot/delaunay-voronoi"},
        {name: "Image", path: "plot/image"}
      ]
    }
    // {
    // name: "Others",
    // pages: [
    // { name: "Mosaic", path: "others/mosaic" },
    // { name: "Three.js", path: "others/three.js" },
    // { name: "Three.js", path: "others/a-frame" },
    // ],
    // },
    */
  ],

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // root: "docs", // path to the source root for preview
  // output: "dist", // path to the output root for build
  sidebar: true,
  search: true,
  footer: `
    ${FOOTER_OBSERVABLE}
    ${VERCEL_SPEED_INSIGHTS}
    ${VERCEL_WEB_ANALYTICS}
    ${VERCEL_COMMENTS}
  `
};
