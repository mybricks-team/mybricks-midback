import { EnumMode, IConfig, IConfigBuilder, SdkContext } from "../types";
import servicePlugin, {
    call as callConnectorHttp,
    mock as connectorHttpMock,
} from '@mybricks/plugin-connector-http'
import { message } from 'antd'

export const USE_CUSTOM_HOST = '__USE_CUSTOM_HOST__'

export const configConnector: IConfigBuilder<SdkContext> = (context, config) => {

    // 添加env变量
    config.com.env = {
        ...config.com.env,
        get callConnector() {
            return createCallConnector(context)
        },
        get getExecuteEnv() {
            return () => context.pageContent.executeEnv
        }
    }

    const connectorEditors = createEditItems(context.pageContent)
    // 添加editor
    const debugEditor = config.editViewItems.cate0.items.find(item => item.title === '调试')
    debugEditor.items.push(...connectorEditors)

    // 添加连接器插件
    config.plugins.push({
        name: 'connector',
        instance: servicePlugin({
            isPrivatization: context.pageContent?.setting?.system.config?.isPureIntranet === true
        })
    })
}


const createCallConnector = (context: SdkContext) => (connector, params, connectorConfig = {}) => {
    const { pageContent } = context
    const plugin = context.designerRef.current?.getPlugin(connector.connectorName);
    if (pageContent.executeEnv === USE_CUSTOM_HOST && !pageContent.MYBRICKS_HOST.default) {
        throw new Error(`自定义域名必须设置default域名`)
    }
    let newParams = params;
    if (pageContent.executeEnv === USE_CUSTOM_HOST) {
        if (params instanceof FormData) {
            newParams.append('MYBRICKS_HOST', JSON.stringify(pageContent.MYBRICKS_HOST));
        } else if (Array.isArray(newParams)) {
            newParams['MYBRICKS_HOST'] = { ...pageContent.MYBRICKS_HOST };
        } else if (typeof newParams === 'object') {
            newParams = { ...params, MYBRICKS_HOST: { ...pageContent.MYBRICKS_HOST } };
        }
    }
    if (!plugin) {
        /** 启动 Mock */
        //@ts-ignore
        if (connectorConfig?.openMock) {
            return connectorHttpMock({ ...connector, ...connectorConfig });
        }

        //服务接口类型
        return callConnectorHttp(
            { ...connector, script: connector.script, useProxy: !pageContent.directConnection },
            newParams,
            {
                ...connectorConfig,
                before: options => {
                    return {
                        ...options,
                        url: shapeUrlByEnv(pageContent.envList, pageContent.executeEnv, options.url, pageContent.MYBRICKS_HOST)
                    }
                }
            }
        );
    } else {
        return plugin.callConnector({ ...connector, useProxy: !pageContent.directConnection }, newParams, {
            ...connectorConfig,
            before: options => {
                return {
                    ...options,
                    url: shapeUrlByEnv(pageContent.envList, pageContent.executeEnv, options.url, pageContent.MYBRICKS_HOST)
                }
            }
        });
    }
}

const getExecuteEnvByMode = (debugMode, ctx, envList) => {
    if (debugMode === EnumMode.DEFAULT) {
        ctx.executeEnv = ''
    } else if (debugMode === EnumMode.ENV && (!ctx.executeEnv || !envList.find(item => item.name === ctx.executeEnv))) {
        ctx.executeEnv = envList[0].name
    } else if (debugMode === EnumMode.CUSTOM) {
        ctx.executeEnv = USE_CUSTOM_HOST
    }
}

const createEditItems = (pageContent: SdkContext['pageContent']) => {
    const envList = pageContent.envList || []

    pageContent.debugMode = pageContent.executeEnv === USE_CUSTOM_HOST
        ? EnumMode.CUSTOM
        : envList.length > 0
            ? EnumMode.ENV
            : EnumMode.DEFAULT


    getExecuteEnvByMode(pageContent.debugMode, pageContent, envList)
    const debugModeOptions = envList.length > 0
        ? [
            { label: '选择环境', value: EnumMode.ENV },
            { label: '自定义域名', value: EnumMode.CUSTOM }
        ]
        : [
            { label: '默认', value: EnumMode.DEFAULT },
            { label: '自定义域名', value: EnumMode.CUSTOM }
        ]
    return [{
        title: '直连',
        type: 'Switch',
        description: '直连模式下服务接口访问将直接请求，不再走代理',
        value: {
            get() {
                return pageContent.directConnection
            },
            set(_, value) {
                pageContent.directConnection = value
            }
        }
    },
    {
        title: '调试模式',
        type: 'Radio',
        description: '选择配置接口前缀域名的方式',
        options: debugModeOptions,
        value: {
            get() {
                return pageContent.debugMode
            },
            set(_, value) {
                pageContent.debugMode = value
                getExecuteEnvByMode(value, pageContent, envList)
            }
        }
    },
    {
        title: '调试环境',
        type: 'select',
        description: '所选环境对应的域名将拼接到接口地址前，发布时的环境不受此控制，你可以在应用配置处修改可选环境（需管理员权限）',
        ifVisible({ data }) {
            return pageContent.debugMode === EnumMode.ENV;
        },
        options: {
            options: envList.map(item => ({
                value: item.name,
                label: item.title
            })),
            placeholder: '请选择调试环境'
        },
        value: {
            get() {
                return pageContent.executeEnv || ''
            },
            set(context, v) {
                pageContent.executeEnv = v
            }
        }
    },
    {
        title: '自定义域名',
        description: '自定义各个接口的域名，在接口中以{MYBRICKS_HOST.变量}的形式进行引用，发布后的页面需要主动在window.MYBRICKS_HOST对象上设置域名信息',
        type: 'map',
        ifVisible(info) {
            return pageContent.debugMode === EnumMode.CUSTOM
        },
        options: {
            allowEmptyString: false
        },
        value: {
            get(info) {
                if (!pageContent.MYBRICKS_HOST) {
                    pageContent.MYBRICKS_HOST = {}
                }
                if (!("default" in pageContent.MYBRICKS_HOST)) {
                    pageContent.MYBRICKS_HOST.default = 'https://your-domain-name.com'
                }
                return pageContent.MYBRICKS_HOST
            },
            set(info, value) {
                if (typeof value?.default === 'undefined') {
                    message.error('必须包含变量名为default的域名')
                } else if (!value?.default) {
                    message.error('default域名不能为空')
                } else if (Object.values(value).some(item => !item)) {
                    message.error('域名不能为空')
                } else {
                    pageContent.MYBRICKS_HOST = value
                }
            }
        },
    },
    {
        title: '环境信息设置',
        description: '可以在应用配置处修改使用的环境',
        ifVisible({ data }) {
            return pageContent.debugMode === EnumMode.ENV;
        },
        type: 'array',
        options: {
            getTitle: (item) => {
                return item.title
            },
            items: [{
                title: '环境标识(禁止修改)',
                type: 'text',
                value: 'name',
                options: {
                    readonly: true
                }
            }, {
                title: '域名',
                type: 'text',
                value: 'value'
            }],
            addable: false,
            deletable: false,
            draggable: false
        },
        value: {
            get({ data, focusArea }) {
                return pageContent.envList
            },
            set({ data, focusArea, output, input, ...res }, value) {
                pageContent.envList = value
            }
        }
    }]

}

export const shapeUrlByEnv = (envList, env, url, mybricksHost) => {
    if (!envList || !env || /^(https?|ws)/.test(url)) return url
    if (env === USE_CUSTOM_HOST) {
        return combineHostAndPath(mybricksHost.default, url)
    }
    const data = (envList || []).find(item => item.name === env)
    if (!data || !data.value) return url
    return data.value + url
}

export const combineHostAndPath = (host, path) => {
    const _host = host.replace(/\/$/, '')
    const _path = path.replace(/^\//, '')
    return _host + '/' + _path
}
