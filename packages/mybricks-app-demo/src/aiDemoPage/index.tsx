import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Input, Spin } from 'antd'
import AIGenerate from './gen-ai-com2'
import { useProjectFiles } from './useProjectFiles'
import Code from './Code'
import ChatApp from './Chat'

const container = document.getElementById('root')
// @ts-ignore
const root = ReactDOM.createRoot(container)

root.render(<MyApp />)
import { createContext } from 'react';

export const ProjectFilesContext = createContext({
  projectFiles: {},
  updateProjectFilesFromSrc: (srcFiles: { 'index.tsx': string; 'index.less': string }) => { },
  componentError: null as string | null,
  setComponentError: (error: string | null) => { }
});

function MyApp() {
  const [result, setResult] = useState({ "index.tsx": "", "index.less": "", deps: [] as string[] });
  const [loading, setLoading] = useState(false);
  const { projectFiles, updateProjectFilesFromSrc } = useProjectFiles(result, { buildTarget: 'component' });
  const aiRef = useRef<AIGenerate | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);

  const handleSendMessage = async (prompt: string, response: (response: string) => void) => {
    setLoading(true);
    try {
      if (aiRef.current) {
        await aiRef.current.talk(prompt);
        setResult(aiRef.current.resultComponent);
        response(JSON.stringify(aiRef.current.resultComponent));
      } else {
        const ai = new AIGenerate();
        aiRef.current = ai;
        await ai.initGenerateComponent(prompt);
        setResult(ai.resultComponent);
        response(JSON.stringify(ai.resultComponent));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFixComponent = async () => {
    setLoading(true);
    try {
      if (aiRef.current && componentError) {
        await aiRef.current.fixComponent(componentError);
        setResult(aiRef.current.resultComponent);
        setComponentError(null);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    aiRef.current = null;
  }

  const build = () => {
    localStorage.setItem('projectFiles', JSON.stringify(projectFiles))
    window.open('/build.html', '_blank')
  }
  return (<ProjectFilesContext.Provider value={{ projectFiles, updateProjectFilesFromSrc, componentError, setComponentError }}>
    <div className='flex flex-row w-full h-[100vh]'>
      <div className='flex flex-col w-[30%] px-4'>
        <h1 className='w-full mb-4 text-2xl font-bold text-center'>ai 对话区</h1>
        <ChatApp onSendMessage={handleSendMessage} onReset={handleReset} />
      </div>
      <div className=' w-[70%]'>
        <h1 className='w-full mb-4 text-2xl font-bold text-center'>代码预览</h1>
        <Spin spinning={loading}>
          <div className='mt-4'>
            <Code />
            <Button className='ml-2 mt-2' onClick={build} loading={loading}>构建</Button>
            {
              componentError && <Button className='ml-2 mt-2' onClick={handleFixComponent} loading={loading}>修复</Button>
            }
          </div>
        </Spin>
      </div>
    </div>
  </ProjectFilesContext.Provider>
  )
}
