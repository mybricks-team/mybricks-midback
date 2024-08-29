import { useEffect, useState } from 'react';

interface ProjectFiles {
  '/index.tsx': string;
  '/index.less': string;
  '/package.json': string;
  '/app.js': string;
}

export function useProjectFiles(srcFiles: {
  'index.tsx': string;
  'index.less': string;
}, options: {
  buildTarget: 'page' | 'component';
} = {}) {
  const { buildTarget = 'page' } = options;
  const [projectFiles, setProjectFiles] = useState<ProjectFiles>({
    '/index.less': '',
    '/index.tsx': '',
    '/app.js': '',
    '/package.json': '{}',
  });

  const updateProjectFilesFromSrc = (srcFiles: {
    'index.tsx': string;
    'index.less': string;
  }) => {
    const files = {
      '/app.js': `
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
    "antd": "^4.24.16",
    "@ant-design/charts": "latest"
  },
  "main": "/index.tsx",
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack-dev-server --config ./webpack.config.js"
  },
  "devDependencies": {
    "@babel/preset-typescript": "latest",
    "webpack": "^5.94.0",
      "vite": "^5.2.0",
    "webpack-dev-server": "^4.9.3",
    "webpack-cli": "^4.10.0",
    "css-loader": "^7.1.2",
    "less": "^4.2.0",
    "less-loader": "^12.2.0",
    "babel-loader": "^9.1.3",
    "@babel/core": "^7.25.2",
    "@babel/preset-env": "^7.25.4",
    "@babel/preset-react": "^7.24.7"
  }
}
`,
      '/index.tsx': srcFiles['index.tsx'] || `
export default function App() {
  return <h1>Hello world</h1>
}
`,
      '/index.less': srcFiles['index.less'] || `

`,
      '/webpack.config.js': `
module.exports = {
  entry: "${buildTarget === 'page' ? '/app.js' : '/index.jsx'}",
  output: {
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'
            ]
          }
        }
      },
      {
        test: /\.(less|css)$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
  mode: 'production',
}
`,
      'vite.config.js': `
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});

`
    }
    console.log(`files`, files)
    setProjectFiles(files)
  }

  useEffect(() => {
    updateProjectFilesFromSrc(srcFiles)
  }, [srcFiles])
  return {
    projectFiles,
    updateProjectFilesFromSrc
  };
}
