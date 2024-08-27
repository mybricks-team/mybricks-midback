import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button } from 'antd'
import styles from './styles.less'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(<MyApp />)

function MyApp() {
  const onClickTest = () => {}

  const onRefTest = () => {}

  return (
    <>
      <div style={{ padding: '24px' }}>
        <div>
          <Button type="primary">产物生成</Button>
        </div>
        <div className={styles.container}>
          <div className={styles.leftWarrper}>ai 对话区</div>
          <div className={styles.rightWarrper}>组件预览</div>
        </div>
      </div>
    </>
  )
}
