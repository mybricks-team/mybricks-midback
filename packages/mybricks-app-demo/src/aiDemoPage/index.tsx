import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Input, Spin } from 'antd'
import genAICom from './gen-ai-com'
import { useProjectFiles } from './useProjectFiles'
import Code from './Code'
import ChatApp from './Chat'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(<MyApp />)
import { createContext } from 'react';

export const ProjectFilesContext = createContext({
  projectFiles: {},
  updateProjectFilesFromSrc: (srcFiles: { 'index.tsx': string; 'index.less': string }) => { },
});

function MyApp() {
    const [result, setResult] = useState({ "index.tsx": "", "index.less": "" });
  const [loading, setLoading] = useState(false);
  const { projectFiles, updateProjectFilesFromSrc } = useProjectFiles(result, { buildTarget: 'component' });
  const handleSendMessage = async (prompt: string, response: (response: string) => void) => {
    setLoading(true);
    try {
      const result = await genAICom(prompt);
      setResult(result);
      response(`index.tsx:\n${result['index.tsx']}\nindex.less:\n${result['index.less']}`);
    } finally {
      setLoading(false);
    }
  };

  const build = () => {
    localStorage.setItem('projectFiles', JSON.stringify(projectFiles))
    window.open('/build.html', '_blank')
  }
  return (<ProjectFilesContext.Provider value={{ projectFiles, updateProjectFilesFromSrc }}>
    <div className='flex flex-row w-full h-[100vh]'>
      <div className='flex flex-col w-[30%] px-4'>
        <h1 className='w-full mb-4 text-2xl font-bold text-center'>ai 对话区</h1>
        <ChatApp onSendMessage={handleSendMessage} />
      </div>
      <div className=' w-[70%]'>
        <h1 className='w-full mb-4 text-2xl font-bold text-center'>代码预览</h1>
        <Spin spinning={loading}>
          <div className='mt-4'>
            <Code />
            <Button className='ml-2 mt-2' onClick={build} loading={loading}>构建</Button>
          </div>
        </Spin>
      </div>
    </div>
  </ProjectFilesContext.Provider>
  )
}
