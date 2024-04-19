import React, {
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import ReactDOM from 'react-dom'
import { Button } from 'antd'
import templateDumpJSON from './testTpl.json'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(<MyApp />)

function MyApp() {
  return <Template />
}

interface CommandParams {
  init: (params: { comLibs: any[]; dumpJSON: any }) => { dump; getCom }
  getCom: (params: { sceneTitle?: string; comTitle?: string }) => any
  dump: () => any
  appendCom
  appendScene
  removeCom
}

// 引擎命令 API
const command: CommandParams = (window as any).mybricks.command

const demoModel = {
  username: {
    fieldName: '姓名',
    fieldKey: 'username',
    type: 'string',
  },
  sex: {
    fieldName: '性别',
    fieldKey: 'sex',
    type: 'enum',
  },
}

function Template() {
  const libs = useMemo(() => {
    let libsInWindow = window['__comlibs_edit_']

    return libsInWindow
  }, [])

  const toPageJson = () => {
    const templateJSON = JSON.stringify(templateDumpJSON)

    // 初始化模板实例
    const template = command.init({
      comLibs: libs,
      dumpJSON: templateJSON,
    })

    // 解析模型
    const pageConfig = parseModel(demoModel)

    // 获取模版中某场景下的某个组件
    // 从模板中获取表单
    const comForm = template.getCom({
      sceneTitle: '主场景',
      comTitle: '表单容器',
    })

    // 从模板中获取表格
    const comTable = template.getCom({
      sceneTitle: '主场景',
      comTitle: '数据表格',
    })

    const newItems = pageConfig.formItems.map((item) => {
      const formItemNamespaceMap = {
        string: 'mybricks.normal-pc.form-text',
        enum: 'mybricks.normal-pc.select',
      }
      // 给表单容器的插槽添加组件，同时返回当前组件的信息
      const comItem = comForm.slots[0].appendChild({
        namespace: formItemNamespaceMap[item.type],
      })

      return {
        id: comItem.id,
        props: {
          label: item.label,
          name: item.name,
        },
      }
    })

    comForm.data.items = comForm.data.items.map((formItem) => {
      const configItem = newItems.find((item) => item.id === formItem.id)

      return {
        ...formItem,
        ...configItem?.props,
      }
    })

    const newColumns = pageConfig.tableCol.map((item) => {
      return { ...item, contentType: 'text' }
    })

    comTable.data.columns = newColumns

    const json = template.dump()

    console.log(JSON.stringify(json))
  }

  return (
    <div>
      <Button onClick={toPageJson}>测试</Button>
    </div>
  )
}
/**
 * @description 解析模型，输出用于生成页面的数据结构
 */
const parseModel = (model) => {
  const pageConfig: any = {
    formItems: [],
    tableCol: [],
  }

  Object.keys(model).forEach((key) => {
    const modelItem = model[key]

    pageConfig.formItems.push({
      label: modelItem.fieldName,
      name: modelItem.fieldKey,
      type: modelItem.type,
    })

    pageConfig.tableCol.push({
      title: modelItem.fieldName,
      dataIndex: modelItem.fieldKey,
    })
  })

  return pageConfig
}
