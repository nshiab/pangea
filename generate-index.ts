/**
 * This script generates markdown for the home page, see src/thumbnail/index.md
 */
import {existsSync, writeFileSync} from "node:fs";
import type {AsPlainObject as MinisearchIndex} from "minisearch";
type Section = {title: string; pages?: string[]; description?: string};
type Document = {id: string; title: string; light?: string; dark?: string};
import {sections} from "./src/index.json" assert {type: "json"};

const HTTP_ROOT = "http://127.0.0.1:3033";
const categories = new Map<string, Section>(sections as [string, Section][]);

const intro = `# Pangea Proxima
## Examples, techniques, algorithms: a collection edited by Fil

_What?_ These pages demonstrate some modern data visualization techniques that you
can use on the Web. They are built with [Observable Framework](https://observablehq.com/framework/),
an open-source static site generator for data apps, dashboards, reports, and more.
We mostly use [Observable Plot](https://observablehq.com/plot/) and [D3](https://d3js.org/),
but also venture outside this ecosystem.

_How?_ To access the code of any page, just click on the view source icon <span>⚉</span> in the top-right corner. If
you’d like to contribute examples, please open a pull-request on the project’s GitHub [repo](https://github.com/fil/pangea). If you want something that you
don’t find here, please open a [feature request](https://github.com/Fil/pangea/issues/new).

_Who?_ I’m Fil Rivière, I work at [Observable](https://observablehq.com/) with the aim of building a strong foundation
for data visualization on the Web. This is a place where I collect, experiment, showcase, and share some
of the goodies. Most of it was authored by other people: Mike Bostock, Volodymyr Agafonkin, Tom McWright, Jason Davies, Allison Horst, Franck Lebeau, Ian
Johnson, Shirley Wu, Nadieh Bremer, Jeffrey Heer, Rene Cutura, Jeff Pettiross, Zan Armstrong, Fabian Iwand, Nicolas Lambert,
Cobus Theunissen, Enrico Spinielli, Harry Stevens, Jareb Wilber, Jean-Daniel Fekete, Dominik Moritz, Kerry Roden, Matteo Abrate, Noah Veltman, Danilo Di Cuia, John Alexis Guerra Gómez, and others… thanks to everyone who publishes open source!

<a class="view-source" href="https://github.com/Fil/pangea/blob/main/src/thumbnail/index.md?plain=1">⚉</a>
`;

async function main() {
  const ms: MinisearchIndex = await fetch(`${HTTP_ROOT}/_observablehq/minisearch.json`).then((resp) => resp.json());
  const documents: Document[] = Object.entries(ms.documentIds).map(([i, id]) => {
    const pathLight = `thumbnail${id}-light.png`;
    const pathDark = `thumbnail${id}-dark.png`;
    let hasLight = false;
    let hasDark = false;
    try {
      if (existsSync(`src/${pathLight}`)) hasLight = true;
      if (existsSync(`src/${pathDark}`)) hasDark = true;
    } catch (e) {}
    return {
      id,
      title: ms.storedFields[i].title,
      light: hasLight ? `../${pathLight}` : undefined,
      dark: hasDark ? `../${pathDark}` : undefined
    };
  });

  const cat = new Map<string, Set<string>>();

  for (const [word, {pages}] of categories) {
    if (pages) {
      cat.set(
        word,
        new Set(
          pages.map((id) => {
            const i = documents.findIndex((d) => d.id === id);
            if (i > -1) return String(i);
            throw new Error(`Couldn't find ${id}`);
          })
        )
      );
    } else {
      for (const [w, fields] of Object.values(ms.index)) {
        // word is in title[0] or keywords[2]
        if (w === word)
          cat.set(word, new Set([...(Object.keys(fields[0] ?? {}) ?? []), ...(Object.keys(fields[2] ?? {}) ?? [])]));
      }
    }
  }

  cat.set("more", new Set(Array.from(documents, (_, i) => `${i}`)));
  const debug = null; //show_debug(cat, documents);

  const seen = new Set();

  const groups = Array.from(
    cat,
    ([word, ids]) =>
      `## ${categories.get(word)?.title}\n\n${
        categories.get(word)?.description ? `\n\n${categories.get(word)?.description}\n\n` : ""
      }<div class="list">\n${Array.from(ids, (id) =>
        seen.has(id)
          ? (word !== "more" && console.warn("duplicate", documents[id].id), null)
          : (seen.add(id), documents[id])
      )
        .filter((d) => d != null)
        .map(({id, title, light, dark}) =>
          light && dark
            ? `<a href="${id}"><picture><source srcset="${dark}" media="(prefers-color-scheme: dark)"><img src="${light}" loading="lazy"></picture><q>${title}</q></a>`
            : light || dark
            ? `<a href="${id}"><img src="${light ?? dark}" loading="lazy"><q>${title}</q></a>`
            : `<a href="${id}"><q>${title}</q></a>`
        )
        .join("\n")}\n</div>`
  );

  const HEAD = `---
theme: wide
index: false
toc: true
comment: Page generated by generate-index.ts
---

${intro ?? ""}

<style>
#observablehq-header a.view-source {display: none;}
.gallery h2 {
  margin: 2em 0 0.5em 0;
}
.list {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
  gap: 12px;
}
.list a {
  display: block;
  position: relative;
  max-width: 320px;
  width: 260px;
  flex-grow: 1;
  height: 195px;
  border: 1px solid var(--theme-foreground-focus);
  font-family: var(--sans-serif);
}
.list a:hover {
  box-shadow: 0 4px 12px var(--theme-foreground-focus);
  transform: translateY(-1px);
}
.list a q {
  position: absolute;
  top: 0;
  left: 0;
  quotes: none;
  padding: 4px 15px;
  background: var(--theme-foreground-focus);
  color: var(--theme-background-alt);
  max-width: 60%;
  border-radius: 0 0 14px;
  line-height: 1.25em;
  max-height: 2.5em;
  overflow: hidden;
  text-overflow: ellipsis;
}
.list a img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>`;

  process.stdout.write(
    `${HEAD}

<div class=gallery>

${groups.join(`\n\n\n`)}

</div>

${debug ?? ""}
`
  );
}

function show_debug(cat: Map<string, Set<string>>, documents: Document[]) {
  const seen = new Set();
  return Array.from(
    cat,
    ([word, ids]) =>
      `*${word}*\n\n${Array.from(ids, (i) => JSON.stringify(documents[i]?.id))
        .filter((id) => (seen.has(id) ? false : (seen.add(id), true)))
        .join(", <br>")}`
  ).join("\n\n");
}

main();
