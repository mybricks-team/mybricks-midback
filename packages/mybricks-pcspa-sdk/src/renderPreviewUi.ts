import { getRenderWeb, getQueryString, getComs } from './utils'
import { getPreviewBaseConfig } from './getBaseConfig'
import { PreviewStorage } from './utils/previewStorage';

interface IPreviewProps {
    env: any,
    renderType: 'react' | 'vue2' | 'vue3'
}

const fileId = getQueryString("fileId");
const USE_CUSTOM_HOST = "__USE_CUSTOM_HOST__";
const previewStorage = new PreviewStorage({ fileId });
const {
    dumpJson,
    hasPermissionFn,
    executeEnv,
    appConfig,
    envList,
    MYBRICKS_HOST,
    directConnection,
    i18nLangContent,
    debugMockConfig
} = previewStorage.getPreviewPageData();

const renderPreviewUi = (props: IPreviewProps) => {
    const { env, renderType } = props
    const renderUI = getRenderWeb(renderType)

    if (!renderUI) {
        throw Error(`找不到${renderType}渲染器`);
    }

    return renderUI(dumpJson, {
        env: {
            ...env,
            renderCom(json, opts, coms) {
                return renderUI(json, {
                    comDefs: { ...getComs(), ...coms },
                    // observable: window['rxui'].observable,
                    ...(opts || {}),
                    env: {
                        ...(opts?.env || {}),
                        edit: false,
                        runtime: true,
                    },
                });
            },
        },
        events: [
            //配置事件
            {
                type: "jump",
                title: "跳转到",
                exe({ options }) {
                    const page = options.page;
                    if (page) {
                        window.location.href = page;
                    }
                },
                options: [
                    {
                        id: "page",
                        title: "页面",
                        editor: "textarea",
                    },
                ],
            },
        ],
    })
}

const createPreviewConfig = (props: IPreviewProps) => {
    const baseConfig = getPreviewBaseConfig(props)
}

export default renderPreviewUi