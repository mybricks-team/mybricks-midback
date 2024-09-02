import React, { useContext, useEffect, useState } from "react";
import { SandpackProvider, Sandpack, SandpackLayout, SandpackPreview, SandpackCodeEditor, useSandpack, useTranspiledCode } from "@codesandbox/sandpack-react";
import { ProjectFilesContext } from ".";
// import { Build } from "./NodeboxBuild";

function Code({ setActiveFile }) {
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

  useEffect(() => {
    setActiveFile(activeFile)
  }, [activeFile])
  useEffect(() => {
    if (sandpack.error) {
      console.log("Preview error:", sandpack.error);
    }
  }, [sandpack.error]);
  return (
    <SandpackLayout style={{ flexDirection: 'column' }} className="h-[calc(100vh-200px)]">
      <SandpackCodeEditor style={{ height: '50%' }} />
      <SandpackPreview
        style={{ height: '50%' }}
        actionsChildren={
          <button onClick={getCode}>
            Get Code
          </button>
        }
      />
    </SandpackLayout>
  );
}
export default () => {

  const { projectFiles, updateProjectFilesFromSrc } = useContext(ProjectFilesContext)
  const [activeFile, setActiveFile] = useState("/index.tsx")
  return <SandpackProvider
    template="react"
    files={projectFiles}
    options={{
      visibleFiles: ["/index.tsx", "/index.less"],
      activeFile,
    }}
    customSetup={{
      entry: '/app.js',
      dependencies: {
        ...Object.entries(JSON.parse(projectFiles['/package.json']).dependencies).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {}),
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
    <Code setActiveFile={setActiveFile} />
  </SandpackProvider>
}