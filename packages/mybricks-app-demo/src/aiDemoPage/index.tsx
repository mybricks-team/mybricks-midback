import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Input, Spin } from 'antd'
import genAICom from './gen-ai-com'
import styles from './styles.less'
import { useProjectFiles } from './useProjectFiles'
import Code from './Code'
import Preview from './Preview'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(<MyApp />)
import { createContext } from 'react';

export const ProjectFilesContext = createContext({
  projectFiles: {},
  updateProjectFilesFromSrc: (srcFiles: { 'index.tsx': string; 'index.less': string }) => { },
});

function MyApp() {
  const [prompt, setPrompt] = useState(`展示一个班级的多个学生成绩随时间变化的折线图，需要展示横纵坐标。每根折线鼠标移动上去会显示学习的姓名等信息`);
  const [result, setResult] = useState({ "index.tsx": "", "index.less": "" });
  const [loading, setLoading] = useState(false);
  const { projectFiles, updateProjectFilesFromSrc } = useProjectFiles(result);
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await genAICom(prompt);
      setResult(result);
      updateProjectFilesFromSrc(result);
    } finally {
      setLoading(false);
    }
  };

  return (<ProjectFilesContext.Provider value={{ projectFiles, updateProjectFilesFromSrc }}>
    <div style={{ padding: '24px' }}>
      <div className={styles.container}>
        <div className={styles.leftWarrper}>
          <h1>ai 对话区</h1>
          <Input.TextArea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <Button onClick={handleGenerate} loading={loading}>生成代码</Button>
        </div>
      </div>
    </div>
    <div className='w-full'>
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
      <Preview />
    </div>
  </ProjectFilesContext.Provider>
  )
}
