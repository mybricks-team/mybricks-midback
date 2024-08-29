import React, { useContext, useEffect } from "react";
import { SandpackProvider, Sandpack, SandpackLayout, SandpackPreview, SandpackCodeEditor, useSandpack, useTranspiledCode } from "@codesandbox/sandpack-react";
import { ProjectFilesContext } from ".";
// import { Build } from "./NodeboxBuild";

function Code() {
  const { sandpack } = useSandpack();
  const { files, activeFile } = sandpack;
  const { projectFiles, updateProjectFilesFromSrc } = useContext(ProjectFilesContext)
  const getCode = () => {
    console.log(`files`, files)
  }

  useEffect(() => {
    if (files['/index.tsx'].code !== projectFiles['/index.tsx'] || files['/index.less'].code !== projectFiles['/index.less']) {
      updateProjectFilesFromSrc({
        'index.tsx': files['/index.tsx'].code,
        'index.less': files['/index.less'].code,
      })
    }
  }, [files])

  return <SandpackLayout>
    <SandpackCodeEditor />
    <SandpackPreview actionsChildren={
      <button onClick={getCode}>
        Get Code
      </button>
    } />
  </SandpackLayout>
}
export default () => {
  const { projectFiles, updateProjectFilesFromSrc } = useContext(ProjectFilesContext)
  return <SandpackProvider
    template="react"
    files={projectFiles}
    options={{
      visibleFiles: ["/index.tsx", "/index.less"],
      activeFile: "/index.tsx",
    }}
    customSetup={{
      entry: '/app.js',
      dependencies: {
        "antd": "^4.24.16",
        "@ant-design/charts": "latest",
        "@babel/preset-typescript": "latest",
        // "react": "^18.3.1",
        // "react-dom": "^18.3.1",
        "webpack": "^5.94.0",
        "css-loader": "^7.1.2",
        "less": "^4.2.0",
        "less-loader": "^12.2.0",
        "babel-loader": "^9.1.3",
        "@babel/core": "^7.25.2",
        "@babel/preset-env": "^7.25.4",
        "@babel/preset-react": "^7.24.7",
      },
    }}
  >
    <Code />
  </SandpackProvider>
}