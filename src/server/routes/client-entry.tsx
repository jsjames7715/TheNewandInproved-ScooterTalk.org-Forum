/** @jsxImportSource hono/jsx */
import type { Context } from "hono";

import type { BlankEnv } from "hono/types";

export function clientEntry(c: Context<BlankEnv>) {
  return c.html(
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>ScooterTalk Forum</title>
        {import.meta.env.PROD ? (
          <>
            <link href="/static/index.css" rel="stylesheet" />
            <script src="/static/index.js" type="module" />
          </>
        ) : (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  import { injectIntoGlobalHook } from "/@react-refresh";
                  injectIntoGlobalHook(window);
                  window.$RefreshReg$ = () => {};
                  window.$RefreshSig$ = () => (type) => type;
                  window.__vite_plugin_react_preamble_installed__ = true;
                `,
              }}
              type="module"
            />
            <script src="/src/client/main.tsx" type="module" />
          </>
        )}
      </head>
      <body>
        <div id="root" />
      </body>
    </html>,
  );
}
