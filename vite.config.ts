import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const partialsDir = resolve(import.meta.dirname, "src/partials");

/**
 * Replaces `<!-- include:name -->` with `src/partials/name.html` and marks
 * links to the current page with `aria-current="page"`.
 */
function partials(): Plugin {
  return {
    name: "partials",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const page = ctx.path.replace(/index\.html$/, "");
        return html.replace(/<!--\s*include:([\w-]+)\s*-->/g, (_, name: string) => {
          const partial = readFileSync(resolve(partialsDir, `${name}.html`), "utf8");
          return partial
            .replaceAll(`href="${page}"`, `href="${page}" aria-current="page"`)
            .trimEnd();
        });
      },
    },
    configureServer(server) {
      server.watcher.add(partialsDir);
      server.watcher.on("change", (file) => {
        if (file.startsWith(partialsDir)) {
          server.ws.send({ type: "full-reload" });
        }
      });
    },
  };
}

/** Strips HTML comments from built pages; dev keeps them. */
function stripHtmlComments(): Plugin {
  return {
    name: "strip-html-comments",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html.replace(/<!--[\s\S]*?-->\s*/g, "");
      },
    },
  };
}

export default defineConfig({
  plugins: [partials(), stripHtmlComments()],
  build: {
    rolldownOptions: {
      input: {
        main: "index.html",
        funfacts: "funfacts/index.html",
        imprint: "imprint/index.html",
        privacy: "privacy/index.html",
      },
    },
  },
});
