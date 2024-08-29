import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Input, Spin } from 'antd'
import genAICom, { extractThirdPartyPackages } from './gen-ai-com'
import styles from './styles.less'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(<MyApp />)

function MyApp() {
  const [prompt, setPrompt] = useState(`展示一个班级的多个学生成绩随时间变化的折线图，需要展示横纵坐标。每根折线鼠标移动上去会显示学习的姓名等信息`);
  const [result, setResult] = useState({ "index.tsx": "", "index.less": "" });
  const [thirdPartyPackages, setThirdPartyPackages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await genAICom(prompt);
      setResult(result);
      const thirdPartyPackages = extractThirdPartyPackages(result['index.tsx']);
      setThirdPartyPackages(thirdPartyPackages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ padding: '24px' }}>
        <div className={styles.container}>
          <div className={styles.leftWarrper}>
            <h1>ai 对话区</h1>
            <Input.TextArea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <Button onClick={handleGenerate} loading={loading}>生成代码</Button>
            <Spin spinning={loading}>
              <div style={{ marginTop: 20 }}>
                <h2>生成的代码</h2>
                <h3>第三方依赖</h3>
                <pre>{thirdPartyPackages.join('\n')}</pre>
                <h3>index.tsx</h3>
                <pre>{result['index.tsx']}</pre>
                <h3>index.less</h3>
                <pre>{result['index.less']}</pre>
              </div>
            </Spin>

          </div>
          <div className={styles.rightWarrper}>组件预览</div>
        </div>
      </div>
    </>
  )
}
