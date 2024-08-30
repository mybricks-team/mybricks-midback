import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Input, Spin } from 'antd'
import genAICom from './gen-ai-com'
import { useProjectFiles } from './useProjectFiles'
import Code from './Code'


const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(<MyApp />)
import { createContext } from 'react';

export const ProjectFilesContext = createContext({
  projectFiles: {},
  updateProjectFilesFromSrc: (srcFiles: { 'index.tsx': string; 'index.less': string }) => { },
});

function MyApp() {
  const [prompt, setPrompt] = useState(`用antd图表展示一个班级的多个学生成绩随时间变化的折线图，需要展示横纵坐标。每根折线鼠标移动上去会显示学习的姓名等信息`);
  const [result, setResult] = useState({ "index.tsx": "", "index.less": "" });
  // const [thirdPartyPackages, setThirdPartyPackages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { projectFiles, updateProjectFilesFromSrc } = useProjectFiles(result, { buildTarget: 'component' });
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await genAICom(prompt);
      setResult(result);
      // const thirdPartyPackages = extractThirdPartyPackages(result['index.tsx']);
      // setThirdPartyPackages(thirdPartyPackages);
    } finally {
      setLoading(false);
    }
  };

  const build = () => {
    localStorage.setItem('projectFiles', JSON.stringify(projectFiles))
    window.open('/build.html', '_blank')
  }
  return (<ProjectFilesContext.Provider value={{ projectFiles, updateProjectFilesFromSrc }}>
    <div className='flex flex-row w-full'>
      <div className='w-[30%] mt-4 px-4'>
        <h1 className='w-full mb-4 text-2xl font-bold text-center'>ai 对话区</h1>
        <Input.TextArea rows={8} className='w-full' value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <Button type='primary' className='ml-2 mt-2' onClick={handleGenerate} loading={loading}>生成代码</Button>
        <Button className='ml-2 mt-2' onClick={build} loading={loading}>构建</Button>
      </div>
      <div className=' w-[70%] mt-4'>
        <h2 className='w-full text-2xl font-bold text-center'>代码预览</h2>
        <Spin spinning={loading}>
          <div className='mt-4'>
            {/* <h2>生成的代码</h2>
                <h3>index.tsx</h3>
                <pre>{result['index.tsx']}</pre>
                <h3>index.less</h3>
                <pre>{result['index.less']}</pre> */}
            <Code />
          </div>
        </Spin>
      </div>
    </div>
  </ProjectFilesContext.Provider>
  )
}
