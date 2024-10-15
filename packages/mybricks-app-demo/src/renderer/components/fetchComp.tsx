import React, { useEffect, lazy, useState, Suspense } from 'react'
import ReactDOM from 'react-dom'
// import App from './App'
// vite打包, APp 那个
import { deps, getLocalDeps, RenderComCDN, urls } from '../constants'
import { fetchComponent } from '../utils/fetchComUrl'
// // import {} from '@'



export function FetchJsDemo() {
  let newDeps = getLocalDeps(deps, {})

  const [Com, setCom] = useState(undefined)

  const Comp3 =lazy(() => fetchComponent(RenderComCDN, newDeps))

  // console.log(json)
  useEffect(() => {
    fetchComponent(RenderComCDN, newDeps).then(res => {
      console.log('fetch ', res, res)
      setCom(res['default'])
    })

  }, [])
  return (
    <div>
      <div>Demo Load Fetch</div>
      <div>ll</div>
      {Com && <Com />}
      <Suspense fallback={<div>Loading...</div>}>
        <Comp3 />
      </Suspense>
    </div>
  )

  
}
