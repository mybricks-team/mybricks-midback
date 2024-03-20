import React, { forwardRef, useEffect, useMemo } from 'react'
import { createConfigBuilder } from './configBuilder'
import { configConnector } from './connectorService'
import { configI18n } from './i18nService'
import { getDebugBaseConfig } from './getBaseConfig'
import { configDebugHasPermission } from './permissionService'
import { createCustomDebugConfigBuilder } from './customConfigBuilder'
import { PcSpaDesignerProps, SdkContext } from './types'
import { configMockData, proxLocalStorage, proxSessionStorage } from './dataMockService'
import { MaterialService } from '@mybricks/mybricks-material-loader'

const SPADesigner = (window as any).mybricks.SPADesigner

const PcSpaDesigner = forwardRef((props: PcSpaDesignerProps, ref: any) => {
  const { pageContent, useLocalResources, editorItems, envExtra, plugins, material } = props

  useEffect(() => {
    MaterialService.set(material.config ?? {})
  }, [material.config])

  const sdkContext = useMemo(() => {
    if (!pageContent.debugMockConfig) {
      pageContent.debugMockConfig = {
        debugQuery: {},
        debugProps: {},
        debugHeaders: [],
        localStorageMock: [],
        sessionStorageMock: []
      }
    }

    return {
      pageContent: (window as any).mybricks?.createObservable?.(pageContent),
      designerRef: ref,
      getCurrentLocale: () => {
        return `zh`
      },
      material
    }
  }, [pageContent])

  const customConfigBuilder = createCustomDebugConfigBuilder({
    useLocalResources,
    editorItems,
    envExtra,
    plugins
  })

  const config = useMemo(() => {
    const baseConfig = getDebugBaseConfig(sdkContext)
    const buildConfig = createConfigBuilder<SdkContext>(
      configConnector,
      configI18n,
      configDebugHasPermission,
      configMockData,
      customConfigBuilder
    )

    const newConfig = buildConfig(sdkContext, baseConfig)

    return newConfig
  }, [customConfigBuilder])

  useEffect(() => {
    const removeLocalProxy = proxLocalStorage(
      sdkContext.pageContent.debugMockConfig?.localStorageMock
    )
    const removeSessionProxy = proxSessionStorage(
      sdkContext.pageContent.debugMockConfig?.sessionStorageMock
    )

    return () => {
      removeLocalProxy()
      removeSessionProxy()
    }
  }, [
    sdkContext.pageContent.debugMockConfig?.localStorageMock,
    sdkContext.pageContent.debugMockConfig?.sessionStorageMock
  ])

  return <SPADesigner ref={ref} config={config}></SPADesigner>
})

export default PcSpaDesigner
