import { IConfigBuilder, PageContent, SdkContext } from "../types"
export const configMockData: IConfigBuilder<SdkContext> = (context, config) => {
    const { pageContent } = context

    if (!pageContent.debugMockConfig) {
        pageContent.debugMockConfig = {
            debugQuery: {},
            debugProps: {},
            debugHeaders: [],
            localStorageMock: [],
            sessionStorageMock: [],
        }
    }
    // 添加editor
    const debugEditor = config.editViewItems.cate0.items.find(item => item.title === '调试')
    debugEditor.items.push(
        {
            title: '路由参数',
            type: 'code',
            description: '调试模式下，路由的参数配置',
            options: {
                title: '编辑路由参数',
                language: 'json',
                width: 500,
                minimap: {
                    enabled: false
                },
                displayType: 'button'
            },
            value: {
                get() {
                    return pageContent.debugMockConfig.debugQuery ? JSON.stringify(pageContent.debugMockConfig.debugQuery, null, 2) : '{}'
                },
                set(context: any, v: string) {
                    const jsonString = decodeURIComponent(v);
                    try {
                        const jsonData = JSON.parse(jsonString || '{}');
                        pageContent.debugMockConfig.debugQuery = jsonData
                    } catch {
                        console.error('路由参数数据格式错误');
                    }
                }
            }
        },
        {
            title: '主应用参数',
            type: 'code',
            description: '调试模式下，主应用参数配置',
            options: {
                title: '编辑主应用参数',
                language: 'json',
                width: 500,
                minimap: {
                    enabled: false
                },
                displayType: 'button'
            },
            value: {
                get() {
                    return pageContent.debugMockConfig.debugProps ? JSON.stringify(pageContent.debugMockConfig.debugProps, null, 2) : '{}'
                },
                set(context: any, v: string) {
                    const jsonString = decodeURIComponent(v);
                    try {
                        const jsonData = JSON.parse(jsonString || '{}');
                        pageContent.debugMockConfig.debugProps = jsonData
                    } catch {
                        console.error('主应用参数数据格式错误');
                    }
                }
            }
        },
        createMockConfigEditor('localStorageMock', 'localStorage模拟', '调试模式下，localStorage模拟', context.pageContent),
        createMockConfigEditor('sessionStorageMock', 'sessionStorage模拟', '调试模式下，sessionStorage模拟', context.pageContent),
    )
}

function createMockConfigEditor(field, title, description, pageContent: PageContent) {
    return {
        title: title,
        type: 'mapCheckbox',
        options: {
            kType: 'auto',
            displayType: 'button',
            addTip: '添加',
            title: title,
            // option: [
            //   { label: 'Cookie', value: 'Cookie' },
            //   { label: 'trace-context', value: 'trace-context' },
            // ]
        },
        description: description,
        value: {
            get() {
                return pageContent.debugMockConfig[field]
            },
            //每个字段的数据结构为{ key, value, checked }
            set(context, v) {
                pageContent.debugMockConfig[field] = v
            }
        }
    }
}

const originalLocalGetItem = localStorage.getItem;
export const proxLocalStorage = (mockData = []) => {
    const data = getCheckedMockDataMap(mockData)
    localStorage.getItem = function (key) {
        if (key in data) {
            return data[key]
        }
        return originalLocalGetItem.apply(this, arguments);
    };

    return () => {
        localStorage.getItem = originalLocalGetItem
    }
}

const originSessionGetItem = sessionStorage.getItem
export const proxSessionStorage = (mockData = []) => {
    const data = getCheckedMockDataMap(mockData)
    sessionStorage.getItem = function (key) {
        if (key in data) {
            return data[key]
        }
        return originSessionGetItem.apply(this, arguments);
    };

    return () => {
        sessionStorage.getItem = originSessionGetItem
    }
}

export const getCheckedMockDataMap = (originMockDate) => {
    return originMockDate.reduce((res, item) => {
        const { key, value, checked } = item
        if (checked) {
            res[key] = value
        }
        return res
    }, {})
}