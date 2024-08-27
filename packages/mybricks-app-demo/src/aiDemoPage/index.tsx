import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button } from 'antd'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(<MyApp />)

function MyApp() {
  const onClickTest = () => {}

  const onRefTest = () => {}

  return (
    <>
      <div style={{ padding: '24px' }}>123</div>
    </>
  )
}
