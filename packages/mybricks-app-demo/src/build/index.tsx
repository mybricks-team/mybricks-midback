import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Input, Spin } from 'antd'
import Build from './BuildButton'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(<Build />)
