export const getDefaultProjectFiles = ({ buildTarget }) => ({
  '/index.less': '',
  '/index.tsx': `import "./index.less"
  export default function App() {
    return <h1>Hello world</h1>
  }
  `,
  '/app.jsx': `
  import React, { StrictMode } from "react";
  import { createRoot } from "react-dom/client";
  
  import Component from "./index.tsx";
  
  const root = createRoot(document.getElementById("root"));
  root.render(
    <StrictMode>
      <Component />
    </StrictMode>
  )
  `,
  '/package.json': `
  {
    "dependencies": {
      "react": "^18.0.0",
      "react-dom": "^18.0.0",
      "antd": "^5.0.0"
    },
    "main": "/index.tsx",
    "scripts": {
      "build": "npx vite build",
      "dev": "vite"
    },
    "devDependencies": {
      "@babel/preset-typescript": "latest",
        "vite": "^5.2.0",
        "@vitejs/plugin-react": "^4.0.0",
      "css-loader": "^7.1.2",
      "less": "^4.2.0"
    }
  }
  `,
  '/vite.config.js': `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
plugins: [react()],
define: {
    'process.env': {}
  },
 build: {
  outDir: 'dist',
  cssCodeSplit: false, // 禁用 CSS 代码分割
  lib: {
    entry: '/index.tsx', 
    name: 'MybricksComDef',
    fileName: () => "bundle.js",
    formats: ['umd']
  },
  rollupOptions: {
    external: ['react', 'react-dom'],
    output: {
     globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
     }
    },
  },
},
server: {
  headers: {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
  },
},
 css: {
  preprocessorOptions: {
    less: {
      javascriptEnabled: true,
    },
  },
  extract: false
},
});
`, '/index.html': `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/app.jsx"></script>
  </body>
</html>
`
})